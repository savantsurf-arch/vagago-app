import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const distDir = path.resolve(process.cwd(), 'dist');
const serverEntryPath = path.join(distDir, 'server', 'entry-server.js');
const templatePath = path.join(distDir, 'index.html');

const ROUTES = [
  {
    route: '/',
    outFile: 'index.html',
    title: 'Vagas de garagem em Itabuna (BA) | VagaGo',
    ogTitle: 'VagaGo — Garagens em Itabuna',
    twitterTitle: 'Encontre e reserve sua vaga em Itabuna com o VagaGo',
    url: 'https://vagago-app.vercel.app/'
  },
  {
    route: '/login',
    outFile: 'login/index.html',
    title: 'Entrar no VagaGo | Acesse sua conta em Itabuna',
    ogTitle: 'Entrar no VagaGo',
    twitterTitle: 'Acesse sua conta no VagaGo para estacionar ou anunciar',
    url: 'https://vagago-app.vercel.app/login'
  },
  {
    route: '/mapa',
    outFile: 'mapa/index.html',
    title: 'Mapa de Vagas em Itabuna (BA) | VagaGo',
    ogTitle: 'Mapa de Vagas • Itabuna',
    twitterTitle: 'Veja garagens disponíveis perto de você no mapa de Itabuna',
    url: 'https://vagago-app.vercel.app/mapa'
  },
  {
    route: '/buscar',
    outFile: 'buscar/index.html',
    title: 'Buscar Garagens em Itabuna (BA) | VagaGo',
    ogTitle: 'Buscar Garagens em Itabuna',
    twitterTitle: 'Encontre vagas com fotos e preços em Itabuna',
    url: 'https://vagago-app.vercel.app/buscar'
  },
  {
    route: '/anfitriao',
    outFile: 'anfitriao/index.html',
    title: 'Anuncie sua Garagem em Itabuna (BA) | VagaGo',
    ogTitle: 'Anuncie sua Garagem • VagaGo',
    twitterTitle: 'Transforme sua vaga ociosa em renda extra em Itabuna',
    url: 'https://vagago-app.vercel.app/anfitriao'
  },
  {
    route: '/termos',
    outFile: 'termos/index.html',
    title: 'Termos de Uso | VagaGo Itabuna',
    ogTitle: 'Termos de Uso • VagaGo',
    twitterTitle: 'Termos de uso e regras de reserva do VagaGo',
    url: 'https://vagago-app.vercel.app/termos'
  },
  {
    route: '/privacidade',
    outFile: 'privacidade/index.html',
    title: 'Privacidade e LGPD | VagaGo Itabuna',
    ogTitle: 'Privacidade • VagaGo',
    twitterTitle: 'Compromisso com seus dados e privacidade (LGPD)',
    url: 'https://vagago-app.vercel.app/privacidade'
  },
  {
    route: '/cancelamento',
    outFile: 'cancelamento/index.html',
    title: 'Política de Cancelamento | VagaGo Itabuna',
    ogTitle: 'Cancelamento e Reembolso • VagaGo',
    twitterTitle: 'Regras de cancelamento e reembolso transparente',
    url: 'https://vagago-app.vercel.app/cancelamento'
  },
  {
    route: '/contato',
    outFile: 'contato/index.html',
    title: 'Suporte e Contato | VagaGo Itabuna',
    ogTitle: 'Contato e Suporte • VagaGo',
    twitterTitle: 'Fale com o suporte do VagaGo em Itabuna',
    url: 'https://vagago-app.vercel.app/contato'
  }
];

async function runPrerender() {
  if (!fs.existsSync(templatePath) || !fs.existsSync(serverEntryPath)) {
    throw new Error('Build artifacts missing before prerender.');
  }

  const template = fs.readFileSync(templatePath, 'utf-8');
  const { render } = await import(pathToFileURL(serverEntryPath).href);

  for (const item of ROUTES) {
    const appHtml = render(item.route);
    let html = template.replace('<!--app-html-->', appHtml);
    const ogTitle = item.ogTitle || item.title;
    const twitterTitle = item.twitterTitle || item.title;

    html = html
      .replace(/<title>.*?<\/title>/i, `<title>${item.title}</title>`)
      .replace(/<meta property="og:title" content=".*?" \/>/i, `<meta property="og:title" content="${ogTitle}" />`)
      .replace(/<meta name="twitter:title" content=".*?" \/>/i, `<meta name="twitter:title" content="${twitterTitle}" />`)
      .replace(/<link rel="canonical" href=".*?" \/>/i, `<link rel="canonical" href="${item.url}" />`)
      .replace(/<meta property="og:url" content=".*?" \/>/i, `<meta property="og:url" content="${item.url}" />`);

    const targetPath = path.join(distDir, item.outFile);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, html, 'utf-8');
    console.log(`Prerendered: ${item.route} -> dist/${item.outFile} (${html.length} bytes)`);
  }

  fs.rmSync(path.join(distDir, 'server'), { recursive: true, force: true });
}

runPrerender().catch((err) => {
  console.error('Prerender error:', err);
  process.exit(1);
});
