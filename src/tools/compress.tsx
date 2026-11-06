import { useState } from 'preact/hooks';
import { Shrink } from 'lucide-preact';
import type { Tool, ToolProps } from './types';
import { ErrorBox, Field, Note, Progress, Result, Seg } from '../components/ui';
import { FileList } from '../components/FileList';
import { PDFDocument, closePdfJs, loadPdfLib, openPdfJs, savePdf } from '../lib/pdf';
import { baseName, formatBytes, type OutFile } from '../lib/files';

type Level = 'light' | 'medium' | 'strong';

const LEVELS: Record<Level, { label: string; blurb: string; dpi: number; quality: number }> = {
  light: { label: 'Light', blurb: 'Keeps text selectable. Removes metadata and repacks the file. Modest savings.', dpi: 0, quality: 0 },
  medium: { label: 'Medium', blurb: 'Pages become sharp images at 150 DPI. Good balance for sharing.', dpi: 150, quality: 0.78 },
  strong: { label: 'Strong', blurb: 'Pages become images at 100 DPI. Smallest file, best for email.', dpi: 100, quality: 0.65 },
};

async function compressLight(file: File): Promise<Uint8Array> {
  const doc = await loadPdfLib(file);
  doc.setTitle('');
  doc.setAuthor('');
  doc.setSubject('');
  doc.setKeywords([]);
  doc.setProducer('Taskitbaby');
  doc.setCreator('');
  return savePdf(doc, { useObjectStreams: true });
}

async function compressRaster(file: File, dpi: number, quality: number, onProgress: (p: number) => void): Promise<Uint8Array> {
  const src = await openPdfJs(file);
  const out = await PDFDocument.create();
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { alpha: false })!;
  const scale = dpi / 72;
  for (let i = 1; i <= src.numPages; i++) {
    const page = await src.getPage(i);
    const base = page.getViewport({ scale: 1 });
    const vp = page.getViewport({ scale });
    canvas.width = Math.ceil(vp.width);
    canvas.height = Math.ceil(vp.height);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport: vp, canvas }).promise;
    const blob: Blob = await new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('encode failed'))), 'image/jpeg', quality));
    const img = await out.embedJpg(await blob.arrayBuffer());
    const p = out.addPage([base.width, base.height]);
    p.drawImage(img, { x: 0, y: 0, width: base.width, height: base.height });
    page.cleanup();
    onProgress(i / src.numPages);
  }
  await closePdfJs(src);
  return savePdf(out, { useObjectStreams: true });
}

function CompressTool({ files, setFiles, reset }: ToolProps) {
  const [level, setLevel] = useState<Level>('medium');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number>();
  const [error, setError] = useState<string>();
  const [out, setOut] = useState<{ files: OutFile[]; before: number; after: number }>();

  const run = async () => {
    setBusy(true);
    setError(undefined);
    setProgress(0);
    try {
      const outs: OutFile[] = [];
      let before = 0;
      let after = 0;
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const cfg = LEVELS[level];
        let bytes = cfg.dpi ? await compressRaster(f, cfg.dpi, cfg.quality, (p) => setProgress((i + p) / files.length)) : await compressLight(f);
        // never hand back something bigger than the original
        if (bytes.byteLength >= f.size) bytes = new Uint8Array(await f.arrayBuffer());
        before += f.size;
        after += bytes.byteLength;
        outs.push({ name: `${baseName(f.name)}_compressed.pdf`, data: bytes, type: 'application/pdf' });
        setProgress((i + 1) / files.length);
      }
      setOut({ files: outs, before, after });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (out) {
    const saved = out.before - out.after;
    const pct = out.before ? Math.round((saved / out.before) * 100) : 0;
    return (
      <Result
        title={pct > 0 ? `${pct}% smaller` : 'Already compact'}
        files={out.files}
        zipName="compressed.zip"
        onReset={reset}
        note={
          <p class="muted">
            {formatBytes(out.before)} → {formatBytes(out.after)}
            {pct <= 0 ? '. This file was already as small as we can make it at this level; try a stronger one.' : ''}
          </p>
        }
      />
    );
  }

  return (
    <div class="workspace">
      <div class="stack">
        <FileList files={files} onChange={setFiles} />
      </div>
      <aside class="panel sidebar">
        <Field label="Compression level">
          <Seg full value={level} onChange={setLevel} options={(Object.keys(LEVELS) as Level[]).map((k) => ({ value: k, label: LEVELS[k].label }))} />
        </Field>
        <p class="muted">{LEVELS[level].blurb}</p>
        {level !== 'light' && <Note>Text won’t be selectable in the output, as pages are saved as images.</Note>}
        {error && <ErrorBox>{error}</ErrorBox>}
        {busy && <Progress value={progress} label="Compressing…" />}
        <div class="actions">
          <button class="btn btn-accent btn-lg" onClick={run} disabled={busy || files.length === 0}>
            Compress {files.length > 1 ? `${files.length} PDFs` : 'PDF'}
          </button>
        </div>
      </aside>
    </div>
  );
}

export const compress: Tool = {
  id: 'compress-pdf',
  name: 'Compress PDF',
  description: 'Shrink PDFs for email and sharing, with a choice of quality.',
  category: 'optimize',
  icon: Shrink,
  accept: 'application/pdf,.pdf',
  multiple: true,
  component: CompressTool,
};
