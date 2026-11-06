import { useState } from 'preact/hooks';
import { Hash } from 'lucide-preact';
import type { Tool, ToolProps } from './types';
import { ErrorBox, Field, Progress, Result, Seg } from '../components/ui';
import { FileList } from '../components/FileList';
import { StandardFonts, loadPdfLib, rgb, savePdf } from '../lib/pdf';
import { baseName, type OutFile } from '../lib/files';

type VPos = 'bottom' | 'top';
type HPos = 'left' | 'center' | 'right';
type Fmt = 'n' | 'page-n' | 'n-of-total' | 'page-n-of-total';

const FORMATS: { value: Fmt; label: string }[] = [
  { value: 'n', label: '1' },
  { value: 'page-n', label: 'Page 1' },
  { value: 'n-of-total', label: '1 / 12' },
  { value: 'page-n-of-total', label: 'Page 1 of 12' },
];

function fmtNumber(f: Fmt, n: number, total: number) {
  switch (f) {
    case 'n':
      return `${n}`;
    case 'page-n':
      return `Page ${n}`;
    case 'n-of-total':
      return `${n} / ${total}`;
    case 'page-n-of-total':
      return `Page ${n} of ${total}`;
  }
}

function PageNumbersTool({ files, setFiles, reset }: ToolProps) {
  const [vpos, setVpos] = useState<VPos>('bottom');
  const [hpos, setHpos] = useState<HPos>('center');
  const [fmt, setFmt] = useState<Fmt>('n');
  const [start, setStart] = useState(1);
  const [fontSize, setFontSize] = useState(11);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [out, setOut] = useState<OutFile[]>();

  const run = async () => {
    setBusy(true);
    setError(undefined);
    try {
      const outs: OutFile[] = [];
      for (const f of files) {
        const doc = await loadPdfLib(f);
        const font = await doc.embedFont(StandardFonts.Helvetica);
        const pages = doc.getPages();
        const total = pages.length + start - 1;
        pages.forEach((p, i) => {
          const text = fmtNumber(fmt, i + start, total);
          const { width, height } = p.getSize();
          const tw = font.widthOfTextAtSize(text, fontSize);
          const margin = 28;
          const x = hpos === 'left' ? margin : hpos === 'right' ? width - margin - tw : (width - tw) / 2;
          const y = vpos === 'bottom' ? margin : height - margin - fontSize;
          p.drawText(text, { x, y, size: fontSize, font, color: rgb(0.2, 0.2, 0.2) });
        });
        outs.push({ name: `${baseName(f.name)}_numbered.pdf`, data: await savePdf(doc), type: 'application/pdf' });
      }
      setOut(outs);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (out) return <Result title="Page numbers added" files={out} zipName="numbered.zip" onReset={reset} />;

  return (
    <div class="workspace">
      <div class="stack">
        <FileList files={files} onChange={setFiles} />
        {/* live preview of placement */}
        <div class="panel" style={{ display: 'grid', placeItems: 'center', padding: 24 }}>
          <div
            style={{
              width: 180,
              aspectRatio: '1 / 1.41',
              background: '#fff',
              borderRadius: 4,
              position: 'relative',
              color: '#333',
              fontSize: 10,
              fontFamily: 'Helvetica, Arial, sans-serif',
            }}
          >
            <span
              style={{
                position: 'absolute',
                [vpos]: 10,
                ...(hpos === 'center' ? { left: 0, right: 0, textAlign: 'center' } : { [hpos]: 10 }),
              }}
            >
              {fmtNumber(fmt, start, start + 11)}
            </span>
          </div>
        </div>
      </div>
      <aside class="panel sidebar">
        <Field label="Position">
          <Seg
            full
            value={vpos}
            onChange={setVpos}
            options={[
              { value: 'bottom', label: 'Bottom' },
              { value: 'top', label: 'Top' },
            ]}
          />
          <Seg
            full
            value={hpos}
            onChange={setHpos}
            options={[
              { value: 'left', label: 'Left' },
              { value: 'center', label: 'Center' },
              { value: 'right', label: 'Right' },
            ]}
          />
        </Field>
        <Field label="Format">
          <select class="select" value={fmt} onChange={(e) => setFmt((e.currentTarget as HTMLSelectElement).value as Fmt)}>
            {FORMATS.map((f) => (
              <option value={f.value}>{f.label}</option>
            ))}
          </select>
        </Field>
        <div class="row">
          <Field label="Start at">
            <input class="input" type="number" min={0} value={start} onInput={(e) => setStart(parseInt((e.currentTarget as HTMLInputElement).value) || 1)} />
          </Field>
          <Field label="Size">
            <input class="input" type="number" min={6} max={48} value={fontSize} onInput={(e) => setFontSize(parseInt((e.currentTarget as HTMLInputElement).value) || 11)} />
          </Field>
        </div>
        {error && <ErrorBox>{error}</ErrorBox>}
        {busy && <Progress label="Adding numbers…" />}
        <div class="actions">
          <button class="btn btn-accent btn-lg" onClick={run} disabled={busy || files.length === 0}>
            Add page numbers
          </button>
        </div>
      </aside>
    </div>
  );
}

export const pageNumbers: Tool = {
  id: 'add-page-numbers',
  name: 'Add page numbers',
  description: 'Stamp page numbers wherever you like, in the format you like.',
  category: 'edit',
  icon: Hash,
  accept: 'application/pdf,.pdf',
  multiple: true,
  component: PageNumbersTool,
};
