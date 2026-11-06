import { PDFDocument } from '@cantoo/pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';

pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

export { PDFDocument, degrees, rgb, StandardFonts } from '@cantoo/pdf-lib';

export class PdfPasswordError extends Error {
  constructor() {
    super('This PDF is password protected.');
    this.name = 'PdfPasswordError';
  }
}

/** Load a PDF with pdf-lib for editing. */
export async function loadPdfLib(file: File | ArrayBuffer | Uint8Array, password?: string): Promise<PDFDocument> {
  const bytes = file instanceof File ? await file.arrayBuffer() : file;
  try {
    return await PDFDocument.load(bytes, { password, ignoreEncryption: false, updateMetadata: false });
  } catch (e) {
    const msg = String((e as Error)?.message ?? e);
    if (/encrypt|password/i.test(msg)) throw new PdfPasswordError();
    throw e;
  }
}

const tasks = new WeakMap<PDFDocumentProxy, pdfjs.PDFDocumentLoadingTask>();

/** Open a PDF with PDF.js for rendering / text. Call closePdfJs() when done. */
export async function openPdfJs(file: File | ArrayBuffer | Uint8Array, password?: string): Promise<PDFDocumentProxy> {
  const data = file instanceof File ? new Uint8Array(await file.arrayBuffer()) : file instanceof ArrayBuffer ? new Uint8Array(file) : file;
  const task = pdfjs.getDocument({ data, password });
  try {
    const doc = await task.promise;
    tasks.set(doc, task);
    return doc;
  } catch (e) {
    const name = (e as { name?: string })?.name;
    if (name === 'PasswordException') throw new PdfPasswordError();
    throw e;
  }
}

/** Release the worker resources held by a document opened with openPdfJs(). */
export async function closePdfJs(doc: PDFDocumentProxy): Promise<void> {
  const task = tasks.get(doc);
  tasks.delete(doc);
  await task?.destroy();
}

export async function pageCount(file: File): Promise<number> {
  const doc = await openPdfJs(file);
  const n = doc.numPages;
  await closePdfJs(doc);
  return n;
}

export interface RenderedPage {
  index: number;
  width: number;
  height: number;
  url: string;
}

/**
 * Render pages to data URLs. `targetWidth` is the output pixel width per page.
 * Calls onPage as each page completes so UIs can stream thumbnails in.
 */
export async function renderPages(
  doc: PDFDocumentProxy,
  opts: { targetWidth?: number; scale?: number; indices?: number[]; type?: 'image/jpeg' | 'image/png' | 'image/webp'; quality?: number; onPage?: (p: RenderedPage) => void; signal?: AbortSignal } = {},
): Promise<RenderedPage[]> {
  const type = opts.type ?? 'image/jpeg';
  const quality = opts.quality ?? 0.82;
  const indices = opts.indices ?? Array.from({ length: doc.numPages }, (_, i) => i);
  const out: RenderedPage[] = [];
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { alpha: false })!;

  for (const i of indices) {
    if (opts.signal?.aborted) break;
    const page = await doc.getPage(i + 1);
    const base = page.getViewport({ scale: 1 });
    const scale = opts.scale ?? (opts.targetWidth ? opts.targetWidth / base.width : 1);
    const vp = page.getViewport({ scale });
    canvas.width = Math.ceil(vp.width);
    canvas.height = Math.ceil(vp.height);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport: vp, canvas }).promise;
    const url = canvas.toDataURL(type, quality);
    const r = { index: i, width: canvas.width, height: canvas.height, url };
    out.push(r);
    opts.onPage?.(r);
    page.cleanup();
  }
  canvas.width = canvas.height = 0;
  return out;
}

/** Render a single page to a canvas (caller owns the canvas). */
export async function renderPageToCanvas(doc: PDFDocumentProxy, index: number, scale: number, canvas: HTMLCanvasElement) {
  const page = await doc.getPage(index + 1);
  const vp = page.getViewport({ scale });
  canvas.width = Math.ceil(vp.width);
  canvas.height = Math.ceil(vp.height);
  const ctx = canvas.getContext('2d', { alpha: false })!;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport: vp, canvas }).promise;
  page.cleanup();
  return { width: vp.width, height: vp.height };
}

/** Quick thumbnails for a file (first N pages). */
export async function thumbnails(file: File, opts: { targetWidth?: number; max?: number; onPage?: (p: RenderedPage) => void; password?: string } = {}) {
  const doc = await openPdfJs(file, opts.password);
  const n = Math.min(doc.numPages, opts.max ?? doc.numPages);
  const pages = await renderPages(doc, { targetWidth: opts.targetWidth ?? 220, indices: Array.from({ length: n }, (_, i) => i), onPage: opts.onPage, quality: 0.7 });
  const total = doc.numPages;
  await closePdfJs(doc);
  return { pages, total };
}

export async function savePdf(doc: PDFDocument, opts: { useObjectStreams?: boolean } = {}): Promise<Uint8Array> {
  return doc.save({ useObjectStreams: opts.useObjectStreams ?? true, updateFieldAppearances: false });
}

export function pdfBlob(bytes: Uint8Array): Blob {
  return new Blob([bytes as BlobPart], { type: 'application/pdf' });
}
