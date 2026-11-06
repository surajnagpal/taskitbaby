import { useEffect, useState } from 'preact/hooks';
import { Scissors } from 'lucide-preact';
import type { Tool, ToolProps } from './types';
import { ErrorBox, Field, Progress, Result, Seg } from '../components/ui';
import { PageGrid, type PageItem } from '../components/PageGrid';
import { PDFDocument, loadPdfLib, savePdf, thumbnails } from '../lib/pdf';
import { baseName, parsePageRanges, type OutFile } from '../lib/files';

type Mode = 'ranges' | 'every' | 'chunks';

function SplitTool({ files, reset }: ToolProps) {
  const file = files[0];
  const [items, setItems] = useState<PageItem[]>([]);
  const [total, setTotal] = useState(0);
  const [mode, setMode] = useState<Mode>('ranges');
  const [ranges, setRanges] = useState('');
  const [chunk, setChunk] = useState(2);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number>();
  const [error, setError] = useState<string>();
  const [out, setOut] = useState<OutFile[]>();

  useEffect(() => {
    let alive = true;
    thumbnails(file, {
      targetWidth: 200,
      onPage: (p) => alive && setItems((prev) => [...prev, { key: String(p.index), page: p }]),
    })
      .then((r) => alive && setTotal(r.total))
      .catch((e) => setError((e as Error).message));
    return () => {
      alive = false;
    };
  }, [file]);

  const groups = (): number[][] => {
    if (mode === 'every') return Array.from({ length: total }, (_, i) => [i]);
    if (mode === 'chunks') {
      const g: number[][] = [];
      for (let i = 0; i < total; i += chunk) g.push(Array.from({ length: Math.min(chunk, total - i) }, (_, k) => i + k));
      return g;
    }
    // ranges: each comma-separated part becomes one file
    return ranges
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((part) => parsePageRanges(part, total))
      .filter((g) => g.length);
  };

  const preview = groups();

  const run = async () => {
    setBusy(true);
    setError(undefined);
    setProgress(0);
    try {
      const src = await loadPdfLib(file);
      const name = baseName(file.name);
      const outs: OutFile[] = [];
      const gs = groups();
      for (let i = 0; i < gs.length; i++) {
        const doc = await PDFDocument.create();
        const pages = await doc.copyPages(src, gs[i]);
        pages.forEach((p) => doc.addPage(p));
        const label = gs[i].length === 1 ? `${gs[i][0] + 1}` : `${gs[i][0] + 1}-${gs[i][gs[i].length - 1] + 1}`;
        outs.push({ name: `${name}_${label}.pdf`, data: await savePdf(doc), type: 'application/pdf' });
        setProgress((i + 1) / gs.length);
      }
      setOut(outs);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (out) return <Result title="PDF split" files={out} zipName={`${baseName(file.name)}_split.zip`} onReset={reset} />;

  return (
    <div class="workspace">
      <div class="panel">
        <PageGrid items={items} />
      </div>
      <aside class="panel sidebar">
        <div class="stat">
          <span>Pages</span>
          <b>{total || '…'}</b>
        </div>
        <Field label="Split by">
          <Seg
            full
            value={mode}
            onChange={setMode}
            options={[
              { value: 'ranges', label: 'Ranges' },
              { value: 'every', label: 'Every page' },
              { value: 'chunks', label: 'Every N' },
            ]}
          />
        </Field>
        {mode === 'ranges' && (
          <Field label="Page ranges" hint="Separate files with commas, e.g. 1-3, 4, 5-8">
            <input class="input" placeholder={`e.g. 1-3, 4-${total || 10}`} value={ranges} onInput={(e) => setRanges((e.currentTarget as HTMLInputElement).value)} />
          </Field>
        )}
        {mode === 'chunks' && (
          <Field label="Pages per file">
            <input class="input" type="number" min={1} max={Math.max(1, total)} value={chunk} onInput={(e) => setChunk(Math.max(1, parseInt((e.currentTarget as HTMLInputElement).value) || 1))} />
          </Field>
        )}
        <p class="muted">
          {preview.length ? `${preview.length} file${preview.length === 1 ? '' : 's'} will be created.` : 'Enter the pages to split out.'}
        </p>
        {error && <ErrorBox>{error}</ErrorBox>}
        {busy && <Progress value={progress} label="Splitting…" />}
        <div class="actions">
          <button class="btn btn-accent btn-lg" onClick={run} disabled={busy || !total || preview.length === 0}>
            Split PDF
          </button>
        </div>
      </aside>
    </div>
  );
}

export const split: Tool = {
  id: 'split-pdf',
  name: 'Split PDF',
  description: 'Break a PDF into separate files by page ranges, every page or every N pages.',
  category: 'organize',
  icon: Scissors,
  accept: 'application/pdf,.pdf',
  multiple: false,
  component: SplitTool,
};
