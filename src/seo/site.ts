/**
 * Site-wide SEO settings. `SITE_URL` is read at build time so the same code
 * works on a preview domain and on the final domain.
 */
export const SITE_NAME = 'pdfitbaby';
export const SITE_URL = (import.meta.env?.VITE_SITE_URL as string | undefined)?.replace(/\/+$/, '') || 'https://taskitbaby.com';
export const SITE_TAGLINE = 'Free PDF tools that never upload your files';
export const SITE_DESCRIPTION =
  'Merge, split, compress, convert, protect and edit PDFs for free. Everything runs in your browser, so your files are never uploaded and never leave your device.';

export const HOME_TITLE = 'pdfitbaby';
