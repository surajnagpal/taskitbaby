import { useState } from 'preact/hooks';
import type { ToolProps } from './types';
import { ErrorBox, Field, Progress, Result, Seg } from '../components/ui';
import { FileList } from '../components/FileList';
import { DropZone } from '../components/DropZone';
import { PDFDocument, savePdf } from '../lib/pdf';
import { canvasToBlob, loadImage, type OutFile } from '../lib/files';

type Size = 'fit' | 'a4' | 'letter';
type Orient = 'auto' | 'portrait' | 'landscape';
type Margin = 'none' | 'small' | 'big';

const SIZES: Record<Exclude<Size, 'fit'>, [number, number]> = { a4: [595.28, 841.89], letter: [612, 792] };
const MARGINS: Record<Margin, number> = { none: 0, small: 28, big: 56 };

/** Decode any browser-supported image to JPEG/PNG bytes pdf-lib can embed. */
async function toEmbeddable(file: File): Promise<{ kind: 'jpg' | 'png'; bytes: ArrayBuffer; w: number; h: number }> {
  const type = file.type.toLowerCase();
  if (type === 'image/jpeg' || type === 'image/png') {
    const url = URL.createObjectURL(file);
    try {
      const img = await loadImage(url);
      return { kind: type === 'image/png' ? 'png' : 'jpg', bytes: await file.arrayBuffer(), w: img.naturalWidth, h: img.naturalHeight };
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  // webp, gif, bmp, avif… → re-encode via canvas
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    c.getContext('2d')!.drawImage(img, 0, 0);
    const blob = await canvasToBlob(c, 'image/png');
    return { kind: 'png', bytes: await blob.arrayBuffer(), w: c.width, h: c.height };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function ImageToPdfTool({ files, setFiles, reset }: ToolProps) {
  const [size, setSize] = useState<Size>('fit');
  const [orient, setOrient] = useState<Orient>('auto');
  const [margin, setMargin] = useState<Margin>('none');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number>();
  const [error, setError] = useState<string>();
  const [out, setOut] = useState<OutFile[]>();

  const run = async () => {
    setBusy(true);
    setError(undefined);
    setProgress(0);
    try {
      const doc = await PDFDocument.create();
      for (let i = 0; i < files.length; i++) {
        const im = await toEmbeddable(files[i]);
        const img = im.kind === 'jpg' ? await doc.embedJpg(im.bytes) : await doc.embedPng(im.bytes);
        const m = MARGINS[margin];
        let pw: number, ph: number;
        if (size === 'fit') {
          // 1 px = 0.75 pt (96 dpi) so images keep a sane physical size
          pw = im.w * 0.75 + m * 2;
          ph = im.h * 0.75 + m * 2;
        } else {
          [pw, ph] = SIZES[size];
          const landscape = orient === 'landscape' || (orient === 'auto' && im.w > im.h);
          if (landscape) [pw, ph] = [ph, pw];
        }
        const page = doc.addPage([pw, ph]);
        const maxW = pw - m * 2;
        const maxH = ph - m * 2;
        const s = Math.min(maxW / im.w, maxH / im.h);
        const w = im.w * s;
        const h = im.h * s;
        page.drawImage(img, { x: (pw - w) / 2, y: (ph - h) / 2, width: w, height: h });
        setProgress((i + 1) / files.length);
      }
      setOut([{ name: files.length === 1 ? files[0].name.replace(/\.[^.]+$/, '') + '.pdf' : 'images.pdf', data: await savePdf(doc), type: 'application/pdf' }]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (out) return <Result title="PDF created" files={out} onReset={reset} />;

  return (
    <div class="workspace">
      <div class="stack">
        <FileList files={files} onChange={setFiles} />
        <DropZone accept="image/*" multiple hint="Drop more images or click to add" compact onFiles={(f) => setFiles([...files, ...f])} />
      </div>
      <aside class="panel sidebar">
        <Field label="Page size">
          <Seg
            full
            value={size}
            onChange={setSize}
            options={[
              { value: 'fit', label: 'Fit image' },
              { value: 'a4', label: 'A4' },
              { value: 'letter', label: 'Letter' },
            ]}
          />
        </Field>
        {size !== 'fit' && (
          <Field label="Orientation">
            <Seg
              full
              value={orient}
              onChange={setOrient}
              options={[
                { value: 'auto', label: 'Auto' },
                { value: 'portrait', label: 'Portrait' },
                { value: 'landscape', label: 'Landscape' },
              ]}
            />
          </Field>
        )}
        <Field label="Margin">
          <Seg
            full
            value={margin}
            onChange={setMargin}
            options={[
              { value: 'none', label: 'None' },
              { value: 'small', label: 'Small' },
              { value: 'big', label: 'Big' },
            ]}
          />
        </Field>
        <p class="muted">One image per page, in the order shown. JPG, PNG, WebP, GIF and more.</p>
        {error && <ErrorBox>{error}</ErrorBox>}
        {busy && <Progress value={progress} label="Building PDF…" />}
        <div class="actions">
          <button class="btn btn-accent btn-lg" onClick={run} disabled={busy || files.length === 0}>
            Convert to PDF
          </button>
        </div>
      </aside>
    </div>
  );
}

export default ImageToPdfTool;
