/**
 * Post-build step: turns the single-page build in dist/ into one static HTML
 * file per route, each with its own <title>, description, canonical, social
 * tags and JSON-LD. Also writes sitemap.xml, robots.txt and 404.html.
 *
 * Runs after `vite build` (client) and `vite build --ssr` (dist-ssr/).
 */
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const ssrDir = path.join(root, 'dist-ssr');

const ssrEntry = path.join(ssrDir, 'prerender.js');
if (!existsSync(ssrEntry)) throw new Error(`Missing ${ssrEntry}. Run "vite build --ssr src/prerender.tsx --outDir dist-ssr" first.`);
const { renderRoute, routes } = await import(pathToFileURL(ssrEntry).href);

const template = await readFile(path.join(dist, 'index.html'), 'utf8');
const { site, tools, seo } = routes;
const today = new Date().toISOString().slice(0, 10);

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const json = (o) => JSON.stringify(o).replace(/</g, '\\u003c');

function headTags({ title, description, url, noindex, jsonLd }) {
  const tags = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    noindex ? `<meta name="robots" content="noindex" />` : `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${esc(site.name)}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta name="twitter:card" content="summary" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
  ];
  if (jsonLd) tags.push(`<script type="application/ld+json">${json(jsonLd)}</script>`);
  return tags.join('\n    ');
}

function page(html, head) {
  return template
    .replace(/<title>[\s\S]*?<\/title>\s*/, '')
    .replace(/<meta\s+name="description"[\s\S]*?\/>\s*/, '')
    .replace('</head>', `    ${head}\n  </head>`)
    .replace('<div id="app"></div>', `<div id="app">${html}</div>`);
}

const written = [];
async function emit(file, content) {
  const full = path.join(dist, file);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, content, 'utf8');
  written.push(file);
}

const webApp = (name, url, description) => ({
  '@type': 'WebApplication',
  name,
  url,
  description,
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
});

const allLinks = new Set();

// ---- Home ----
{
  const { html, links } = await renderRoute('/');
  links.forEach((l) => allLinks.add(l));
  const url = `${site.url}/`;
  await emit(
    'index.html',
    page(
      html,
      headTags({
        title: site.homeTitle,
        description: site.description,
        url,
        jsonLd: {
          '@context': 'https://schema.org',
          '@graph': [
            { '@type': 'WebSite', name: site.name, url },
            webApp(site.name, url, site.description),
            {
              '@type': 'ItemList',
              itemListElement: tools.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, url: `${site.url}/${t.id}` })),
            },
          ],
        },
      }),
    ),
  );
}

// ---- Tools ----
for (const t of tools) {
  const s = seo[t.id];
  if (!s) console.warn(`No SEO content for ${t.id}; using tool description.`);
  const { html, links } = await renderRoute(`/${t.id}`);
  links.forEach((l) => allLinks.add(l));
  const url = `${site.url}/${t.id}`;
  // Short tab title; the descriptive wording for search engines lives in the description and page body.
  const title = `${t.name} · ${site.name}`;
  const description = s?.description ?? t.description;
  const graph = [
    webApp(`${t.name} — ${site.name}`, url, description),
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'All tools', item: `${site.url}/` },
        { '@type': 'ListItem', position: 2, name: t.name, item: url },
      ],
    },
  ];
  if (s?.faq?.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: s.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    });
  }
  await emit(`${t.id}.html`, page(html, headTags({ title, description, url, jsonLd: { '@context': 'https://schema.org', '@graph': graph } })));
}

// ---- 404 ----
{
  const { html } = await renderRoute('/__not_found__');
  await emit('404.html', page(html, headTags({ title: `Page not found | ${site.name}`, description: site.description, url: `${site.url}/`, noindex: true })));
}

// ---- sitemap & robots ----
const urls = [{ loc: `${site.url}/`, priority: '1.0' }, ...tools.map((t) => ({ loc: `${site.url}/${t.id}`, priority: '0.8' }))];
await emit(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${esc(u.loc)}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>${u.priority}</priority></url>`)
    .join('\n')}\n</urlset>\n`,
);
await emit('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);

// Sanity check: every tool must be reachable by a plain link from some page.
const missing = tools.map((t) => `/${t.id}`).filter((r) => !allLinks.has(r));
if (missing.length) console.warn('Tools not linked from any pre-rendered page:', missing.join(', '));

await rm(ssrDir, { recursive: true, force: true });
console.log(`Pre-rendered ${written.length} files for ${site.url}:\n  ${written.join('\n  ')}`);
