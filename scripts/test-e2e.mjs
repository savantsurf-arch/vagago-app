import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';

import {
  geocodeAddress,
  geocodeAddressOSM,
  calculateSmartParkOptions,
  getNavigationLinks,
  fetchDrivingRoute,
  calculateOsmAlternativeRoutes
} from '../src/services/geoUtils.js';
import {
  calculateBookingPricing,
  getOccupiedSlotsForDate,
  isSpotAvailableOnDay
} from '../src/services/pricingUtils.js';
import { hashPassword, verifyPassword, sanitizeText } from '../src/services/securityUtils.js';
import { analyzeConciergeMessage } from '../src/services/conciergeService.js';
import { INITIAL_PARKING_SPACES } from '../src/services/mockData.js';

import bookingCreateHandler from '../api/bookings/create.js';
import pixCreateHandler from '../api/pix/create.js';
import pixStatusHandler from '../api/pix/status.js';
import pixWebhookHandler from '../api/pix/webhook.js';
import { applyRateLimit, verifyCsrfOrigin } from '../api/_lib/security.js';

function createMockRes() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(k, v) {
      this.headers[k] = v;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    }
  };
}

async function runTests() {
  console.log('1. Testando prerenderizacao SSR, SEO e assets PWA em dist/...');
  const distDir = path.resolve(process.cwd(), 'dist');
  const expectedFiles = [
    'index.html',
    'login/index.html',
    'mapa/index.html',
    'buscar/index.html',
    'anfitriao/index.html',
    'termos/index.html',
    'privacidade/index.html',
    'cancelamento/index.html',
    'contato/index.html',
    'robots.txt',
    'sitemap.xml',
    'manifest.json',
    'og-image.png',
    'favicon-32x32.png',
    'icons/apple-touch-icon-180.png',
    'icons/icon-192.png',
    'icons/icon-512.png'
  ];

  for (const rel of expectedFiles) {
    const full = path.join(distDir, rel);
    assert.ok(fs.existsSync(full), `Arquivo ausente em dist/: ${rel}`);
  }

  const homeHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');
  assert.ok(!homeHtml.includes('<!--app-html-->'), 'Placeholder SSR nao substituido em index.html');
  assert.ok(homeHtml.includes('<html lang="pt-BR">'), 'lang="pt-BR" ausente');
  assert.ok(homeHtml.includes('application/ld+json'), 'JSON-LD ausente');
  assert.ok(homeHtml.includes('og:image'), 'og:image ausente');
  assert.ok(homeHtml.includes('twitter:card'), 'twitter:card ausente');
  assert.ok(homeHtml.includes('rel="canonical"'), 'canonical ausente');
  const cleanHomeText = homeHtml.replace(/<!--.*?-->/g, '');
  assert.ok(cleanHomeText.includes('Bem-vindo de volta!'), 'Conteudo Principal (Login) nao renderizado na raiz');
  assert.ok(cleanHomeText.includes('rápida e segura!'), 'Frase de impacto ausente na Home');
  assert.ok(cleanHomeText.includes('Entrar com Google'), 'Botao Google ausente na Home');

  const mapaHtml = fs.readFileSync(path.join(distDir, 'mapa/index.html'), 'utf-8').replace(/<!--.*?-->/g, '');
  assert.ok(mapaHtml.includes('Onde você vai estacionar?'), 'Placeholder do Mapa ausente');

  const loginHtml = fs.readFileSync(path.join(distDir, 'login/index.html'), 'utf-8').replace(/<!--.*?-->/g, '');
  assert.ok(loginHtml.includes('Bem-vindo de volta!'), 'Conteudo SSR da Pagina de Login ausente');
  assert.ok(loginHtml.includes('Entrar com Google'), 'Botao Google na Pagina de Login ausente');
  assert.ok(loginHtml.includes('rápida e segura!'), 'Frase da Pagina de Login ausente');

  console.log('2. Testando fluxo E2E: Buscar -> Navegar -> Reservar -> Pagar (Pix)...');
  // 2A. Buscar + Links de Navegacao (Waze / Google Maps / Apple Maps) + Trajeto azul
  const geoCentro = geocodeAddress('Centro - Av. Cinquentenário');
  assert.ok(geoCentro.lat < -14 && geoCentro.lat > -15, 'Geocodificacao Centro fora de Itabuna');
  const smart = calculateSmartParkOptions(INITIAL_PARKING_SPACES, geoCentro.lat, geoCentro.lng);
  assert.ok(smart && smart.allEnriched.length >= 3, 'Busca nao retornou vagas em Itabuna');

  const navLinks = getNavigationLinks(
    smart.allEnriched[0].lat,
    smart.allEnriched[0].lng,
    smart.allEnriched[0].address,
    { lat: geoCentro.lat, lng: geoCentro.lng }
  );
  assert.ok(navLinks.openStreetMapUrl.startsWith('https://www.openstreetmap.org/directions?'));
  assert.ok(navLinks.wazeUrl.startsWith('https://waze.com/ul?ll='));
  assert.ok(navLinks.appleMapsUrl.startsWith('https://maps.apple.com/?daddr='));

  const previewRoute = await fetchDrivingRoute(
    geoCentro.lat,
    geoCentro.lng,
    smart.allEnriched[0].lat,
    smart.allEnriched[0].lng
  );
  assert.ok(previewRoute && Array.isArray(previewRoute.coordinates) && previewRoute.coordinates.length >= 2);
  assert.equal(await fetchDrivingRoute(NaN, geoCentro.lng, -14.78, -39.27), null);

  const osmGeo = await geocodeAddressOSM('Av. Cinquentenário, Centro');
  assert.ok(osmGeo && osmGeo.lat < -14 && osmGeo.lat > -15, 'Geocodificacao OSM fora de Itabuna');
  const altRoutes = calculateOsmAlternativeRoutes(
    geoCentro.lat,
    geoCentro.lng,
    smart.allEnriched[0].lat,
    smart.allEnriched[0].lng,
    'CAR',
    previewRoute
  );
  assert.ok(altRoutes.fastest && altRoutes.shortest && altRoutes.alternative);

  // 2B. Reservar (calculo + bloqueio de conflito + endpoint /api/bookings/create)
  const chosenSpot = smart.allEnriched[0];
  const pricing = calculateBookingPricing({
    spot: chosenSpot,
    planType: 'hora',
    startTime: '14:00',
    endTime: '17:00'
  });
  assert.equal(pricing.totalHours, 3);
  assert.equal(pricing.subtotal, Number((chosenSpot.priceHourly * 3).toFixed(2)));

  const occupied = getOccupiedSlotsForDate(
    [{ spaceId: chosenSpot.id, date: '2026-12-10', startTime: '14:00', endTime: '16:00', bookingStatus: 'Confirmado' }],
    chosenSpot.id,
    '2026-12-10'
  );
  assert.equal(occupied.length, 1);
  assert.equal(isSpotAvailableOnDay({ availableDays: ['Seg', 'Ter'] }, '2026-11-12'), false); // 2026-11-12 é Qui

  const bookingRes = createMockRes();
  await bookingCreateHandler(
    {
      method: 'POST',
      headers: { host: 'vagago-app.vercel.app', origin: 'https://vagago-app.vercel.app', 'x-forwarded-for': '10.0.0.1' },
      body: {
        spaceId: chosenSpot.id,
        spaceTitle: '<script>alert(1)</script>' + chosenSpot.title,
        date: '2026-12-10',
        startTime: '14:00',
        endTime: '17:00',
        planType: 'hora',
        totalPrice: pricing.subtotal,
        totalHours: 3,
        paymentMethod: 'PIX',
        vehicle: { plate: 'BRA2E19', model: 'Corolla' }
      }
    },
    bookingRes
  );
  assert.equal(bookingRes.statusCode, 201);
  assert.ok(bookingRes.body?.ok);
  assert.equal(bookingRes.body.split.feePercent, 10);

  // 2C. Pagar via Pix (/api/pix/create -> /api/pix/status -> /api/pix/webhook)
  const pixRes = createMockRes();
  await pixCreateHandler(
    {
      method: 'POST',
      headers: { host: 'vagago-app.vercel.app', origin: 'https://vagago-app.vercel.app', 'x-forwarded-for': '10.0.0.2' },
      body: {
        amount: pricing.subtotal,
        bookingNumber: bookingRes.body.bookingNumber,
        spaceTitle: chosenSpot.title
      }
    },
    pixRes
  );
  assert.equal(pixRes.statusCode, 200);
  assert.ok(pixRes.body.pixCopyPaste.startsWith('000201'));
  assert.equal(pixRes.body.split.ownerPayout + pixRes.body.split.platformFee, pixRes.body.split.amount);

  const statusRes = createMockRes();
  await pixStatusHandler(
    { method: 'GET', query: { paymentId: pixRes.body.paymentId, provider: 'sandbox' } },
    statusRes
  );
  assert.equal(statusRes.statusCode, 200);
  assert.equal(statusRes.body.status, 'APPROVED');

  process.env.ASAAS_WEBHOOK_TOKEN = 'test_secret_token';
  const badWebhookRes = createMockRes();
  await pixWebhookHandler(
    {
      method: 'POST',
      headers: { 'asaas-access-token': 'wrong_token' },
      body: { payment: { externalReference: bookingRes.body.bookingNumber, status: 'RECEIVED' } }
    },
    badWebhookRes
  );
  assert.equal(badWebhookRes.statusCode, 401);

  const okWebhookRes = createMockRes();
  await pixWebhookHandler(
    {
      method: 'POST',
      headers: { 'asaas-access-token': 'test_secret_token' },
      body: { payment: { externalReference: bookingRes.body.bookingNumber, status: 'RECEIVED' } }
    },
    okWebhookRes
  );
  assert.equal(okWebhookRes.statusCode, 200);
  assert.equal(okWebhookRes.body.status, 'APPROVED');

  console.log('3. Testando seguranca (hash de senha, XSS, CSRF, rate limit, regex)...');
  const pwdHash = await hashPassword('SenhaForte123');
  assert.equal(await verifyPassword('SenhaForte123', pwdHash), true);
  assert.equal(await verifyPassword('SenhaErrada', pwdHash), false);
  assert.ok(!sanitizeText('<img src=x onerror=alert(1)>Olá').includes('<'));

  for (let i = 0; i < 4; i++) {
    const checkMsg = analyzeConciergeMessage('Me chama no 73991234567');
    assert.equal(checkMsg.isBlocked, true, `Regex falhou na iteracao ${i}`);
  }

  const csrfFailRes = createMockRes();
  const csrfAllowed = verifyCsrfOrigin(
    { method: 'POST', headers: { host: 'vagago-app.vercel.app', origin: 'https://malicious.site' } },
    csrfFailRes
  );
  assert.equal(csrfAllowed, false);
  assert.equal(csrfFailRes.statusCode, 403);

  const rlReq = { headers: { 'x-forwarded-for': '203.0.113.99' } };
  assert.equal(applyRateLimit(rlReq, createMockRes(), { max: 2, bucket: 'e2e' }), true);
  assert.equal(applyRateLimit(rlReq, createMockRes(), { max: 2, bucket: 'e2e' }), true);
  const rlBlockedRes = createMockRes();
  assert.equal(applyRateLimit(rlReq, rlBlockedRes, { max: 2, bucket: 'e2e' }), false);
  assert.equal(rlBlockedRes.statusCode, 429);

  console.log('4. Testando servidor HTTP local sobre dist/...');
  await new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const cleanPath = (req.url || '/').split('?')[0];
      const filePath =
        cleanPath === '/'
          ? path.join(distDir, 'index.html')
          : fs.existsSync(path.join(distDir, cleanPath.slice(1), 'index.html'))
          ? path.join(distDir, cleanPath.slice(1), 'index.html')
          : path.join(distDir, cleanPath.slice(1));
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        res.writeHead(200);
        fs.createReadStream(filePath).pipe(res);
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });

    server.listen(0, '127.0.0.1', async () => {
      try {
        const { port } = server.address();
        const routesToVerify = [
          '/',
          '/login',
          '/mapa',
          '/buscar',
          '/anfitriao',
          '/termos',
          '/privacidade',
          '/cancelamento',
          '/contato',
          '/robots.txt',
          '/sitemap.xml',
          '/manifest.json',
          '/og-image.png'
        ];
        for (const route of routesToVerify) {
          const resp = await fetch(`http://127.0.0.1:${port}${route}`);
          assert.equal(resp.status, 200, `Rota HTTP retornou ${resp.status}: ${route}`);
        }
        server.close(resolve);
      } catch (err) {
        server.close(() => reject(err));
      }
    });
  });

  console.log('E2E_ALL_PASSED: Todos os testes buscar -> reservar -> pagar, SSR e seguranca passaram!');
}

runTests().catch((err) => {
  console.error('E2E_FAILED:', err);
  process.exit(1);
});
