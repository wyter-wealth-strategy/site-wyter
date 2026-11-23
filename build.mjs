// Gerador do site da Wyter. Uso: node build.mjs   (saída em dist/)
// Edite textos em src/pages/*.html, dados de contato em src/config.json,
// cabeçalho/rodapé em src/partials/, visual em src/static/css/site.css.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, cpSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const cfg = JSON.parse(readFileSync('src/config.json', 'utf8'));
const partial = (n) => readFileSync(join('src/partials', n), 'utf8');
const head = partial('head.html');
const header = partial('header.html');
const footer = partial('footer.html');

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });
cpSync('src/static', 'dist', { recursive: true });

const waLink = (msg) => `https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent(msg)}`;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function vars(html, meta, url) {
  const social = [
    cfg.instagram && `<a href="${cfg.instagram}" rel="noopener" target="_blank">Instagram</a>`,
    cfg.linkedin && `<a href="${cfg.linkedin}" rel="noopener" target="_blank">LinkedIn</a>`,
    cfg.youtube && `<a href="${cfg.youtube}" rel="noopener" target="_blank">YouTube</a>`
  ].filter(Boolean).join('');
  const map = {
    TITLE: esc(meta.title),
    DESCRIPTION: esc(meta.description),
    URL: url,
    PATH: meta.path,
    OGTYPE: meta.path === '/' ? 'website' : 'article',
    ROBOTS: meta.noindex ? '<meta name="robots" content="noindex">' : '',
    JSONLD: meta.jsonld || '',
    NAV_ATUAL: meta.nav || '',
    SOCIAL: social,
    EMAIL: cfg.email,
    EMAIL_LGPD: cfg.emailLgpd || cfg.email,
    CNPJ: cfg.cnpj,
    CIDADE: cfg.cidade,
    TEL: cfg.whatsappExibicao,
    TELLINK: '+' + cfg.whatsapp,
    PF_URL: cfg.personFinanceUrl,
    SITE: cfg.siteUrl,
    ATUALIZADO: cfg.atualizadoEm,
    ANO: String(new Date().getFullYear())
  };
  html = html.replace(/\{\{wa:([^}]+)\}\}/g, (_, m) => waLink(m.trim()));
  html = html.replace(/\{\{([A-Z_]+)\}\}/g, (all, k) => (k in map ? map[k] : all));
  return html;
}

const pages = [];
for (const f of readdirSync('src/pages').filter((x) => x.endsWith('.html')).sort()) {
  const raw = readFileSync(join('src/pages', f), 'utf8');
  const m = raw.match(/^<!--meta\s*([\s\S]*?)-->\s*/);
  if (!m) throw new Error(`Página sem bloco <!--meta--> : ${f}`);
  const meta = JSON.parse(m[1]);
  const body = raw.slice(m[0].length);
  const url = cfg.siteUrl + meta.path;
  const nav = (c) => (meta.nav === c ? ' aria-current="page"' : '');
  let doc = head + '\n<body>\n' + header + '\n<main id="conteudo">\n' + body + '\n</main>\n' + footer + '\n<script src="/js/site.js" defer></script>\n</body>\n</html>\n';
  doc = doc.replace(/\{\{cur:([a-z-]+)\}\}/g, (_, c) => nav(c));
  doc = vars(doc, meta, url);
  const left = doc.match(/\{\{[^}]*\}\}/g);
  if (left) throw new Error(`Marcador não resolvido em ${f}: ${left.join(', ')}`);
  const out = meta.file || join(meta.path, 'index.html');
  const target = join('dist', out);
  mkdirSync(join(target, '..'), { recursive: true });
  writeFileSync(target, doc);
  if (!meta.noindex) pages.push({ url, lastmod: meta.lastmod || '2026-11-23', priority: meta.priority || '0.7' });
}

const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  pages.map((p) => `  <url><loc>${p.url}</loc><lastmod>${p.lastmod}</lastmod><priority>${p.priority}</priority></url>`).join('\n') + '\n</urlset>\n';
writeFileSync('dist/sitemap.xml', sitemap);
writeFileSync('dist/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${cfg.siteUrl}/sitemap.xml\n`);
writeFileSync('dist/CNAME', 'wyter.com.br\n');
writeFileSync('dist/.nojekyll', '');
console.log(`OK: ${pages.length} páginas indexáveis em dist/`);
