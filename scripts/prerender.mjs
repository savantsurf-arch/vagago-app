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
    title: 'VagaGo | Vagas de Estacionamento e Garagens em Itabuna - BA',
    url: 'https://vagago-app.vercel.app/'
  },
  {
    route: '/login',
    outFile: 'login/index.html',
    title: 'Entrar no VagaGo | Acesse sua conta de Motorista ou Anfitrião',
    url: 'https://vagago-app.vercel.app/login'
  },
  {
    route: '/buscar',
    outFile: 'buscar/index.html',
    title: 'Buscar Vagas no Mapa em Itabuna - BA | VagaGo',
    url: 'https://vagago-app.vercel.app/buscar'
  },
  {
    route: '/anfitriao',
    outFile: 'anfitriao/index.html',
    title: 'Alugue sua Garagem em Itabuna - BA | Seja Anfitrião VagaGo',
    url: 'https://vagago-app.vercel.app/anfitriao'
  },
  {
    route: '/termos',
    outFile: 'termos/index.html',
    title: 'Termos de Uso e Política de Privacidade | VagaGo',
    url: 'https://vagago-app.vercel.app/termos'
  },
  {
    route: '/privacidade',
    outFile: 'privacidade/index.html',
    title: 'Política de Privacidade (LGPD) | VagaGo',
    url: 'https://vagago-app.vercel.app/privacidade'
  },
  {
    route: '/cancelamento',
    outFile: 'cancelamento/index.html',
    title: 'Política de Cancelamento e Reembolso | VagaGo',
    url: 'https://vagago-app.vercel.app/cancelamento'
  },
  {
    route: '/contato',
    outFile: 'contato/index.html',
    title: 'Contato e Suporte WhatsApp | VagaGo Itabuna',
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
    html = html
      .replace(/<title>.*?<\/title>/i, `<title>${item.title}</title>`)
      .replace(/<meta property="og:title" content=".*?" \/>/i, `<meta property="og:title" content="${item.title}" />`)
      .replace(/<meta name="twitter:title" content=".*?" \/>/i, `<meta name="twitter:title" content="${item.title}" />`)
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
