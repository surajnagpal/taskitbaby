import JSZip from 'jszip';

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function baseName(name: string): string {
  const i = name.lastIndexOf('.');
  return i > 0 ? name.slice(0, i) : name;
}

export function extOf(name: string): string {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(i + 1).toLowerCase() : '';
}

export interface OutFile {
  name: string;
  data: Uint8Array | Blob;
  type?: string;
}

export function toBlob(f: OutFile): Blob {
  if (f.data instanceof Blob) return f.data;
  return new Blob([f.data as BlobPart], { type: f.type ?? 'application/octet-stream' });
}

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export async function zipFiles(files: OutFile[], zipName: string): Promise<OutFile> {
  const zip = new JSZip();
  for (const f of files) zip.file(f.name, f.data instanceof Blob ? f.data : (f.data as Uint8Array));
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
  return { name: zipName, data: blob, type: 'application/zip' };
}

export function readAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return file.arrayBuffer();
}

export function readAsDataURL(file: Blob): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = () => rej(r.error);
    r.readAsDataURL(file);
  });
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => rej(new Error('Could not read image'));
    img.src = src;
  });
}

export function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((res, rej) => {
    canvas.toBlob((b) => (b ? res(b) : rej(new Error('Could not encode image'))), type, quality);
  });
}

/** Parse "1-3, 5, 8-10" into zero-based page indices, within [0, total). */
export function parsePageRanges(input: string, total: number): number[] {
  const out = new Set<number>();
  for (const part of input.split(/[,\s]+/).filter(Boolean)) {
    const m = part.match(/^(\d+)(?:-(\d+))?$/);
    if (!m) continue;
    let a = parseInt(m[1], 10);
    let b = m[2] ? parseInt(m[2], 10) : a;
    if (a > b) [a, b] = [b, a];
    for (let i = a; i <= b; i++) if (i >= 1 && i <= total) out.add(i - 1);
  }
  return [...out].sort((x, y) => x - y);
}

export const MIME = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
} as const;
