/**
 * Server-side entry used only at build time (see scripts/prerender.mjs).
 * Renders one route of the app to an HTML string and exposes the data the
 * script needs to write <head> tags, the sitemap and robots.txt.
 */
import { prerender as isoPrerender } from 'preact-iso';
import { App } from './app';
import { TOOLS } from './tools';
import { TOOL_SEO } from './seo/content';
import { HOME_TITLE, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from './seo/site';

/** preact-iso's LocationProvider reads `location` even on the server. */
function stubLocation(path: string) {
  const u = new URL(path, SITE_URL);
  const loc: Record<string, unknown> = {};
  for (const k of ['href', 'origin', 'protocol', 'host', 'hostname', 'port', 'pathname', 'search', 'hash']) loc[k] = String((u as unknown as Record<string, unknown>)[k]);
  (globalThis as unknown as { location: unknown }).location = loc;
}

export async function renderRoute(path: string): Promise<{ html: string; links: string[] }> {
  stubLocation(path);
  const { html, links } = await isoPrerender(<App url={path} />);
  return { html, links: [...(links ?? [])] };
}

export const routes = {
  tools: TOOLS.map((t) => ({ id: t.id, name: t.name, description: t.description, category: t.category })),
  seo: TOOL_SEO,
  site: { name: SITE_NAME, url: SITE_URL, homeTitle: HOME_TITLE, description: SITE_DESCRIPTION },
};
