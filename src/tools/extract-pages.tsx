import { useEffect, useState } from 'preact/hooks';
import type { ToolProps } from './types';
import { ErrorBox, Field, Progress, Result, Toggle } from '../components/ui';
import { PageGrid, type PageItem } from '../components/PageGrid';
import { PDFDocument, loadPdfLib, savePdf, thumbnails } from '../lib/pdf';
import { baseName, parsePageRanges, type OutFile } from '../lib/files';

function ExtractPagesTool({ files, reset }: ToolProps) {
  const file = files[0];
  const [items, setItems] = useState<PageItem[]>([]);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [ranges, setRanges] = useState('');
  const [separate, setSeparate] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [out, setOut] = useState<OutFile[]>();

  useEffect(() => {
    let alive = true;
    thumbnails(file, { targetWidth: 200, onPage: (p) => alive && setItems((prev) => [...prev, { key: String(p.index), page: p }]) })
      .then((r) => alive && setTotal(r.total))
      .catch((e) => setError((e as Error).message));
    return () => {
      alive = false;
    };
  }, [file]);

  const toggle = (key: string) =>
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });

  const applyRanges = (v: string) => {
    setRanges(v);
    setSelected(new Set(parsePageRanges(v, total).map(String)));
  };

  const run = async () => {
    setBusy(true);
    setError(undefined);
    try {
      const src = await loadPdfLib(file);
      const idx = [...selected].map(Number).sort((a, b) => a - b);
      const name = baseName(file.name);
      const outs: OutFile[] = [];
      if (separate) {
        for (const i of idx) {
          const doc = await PDFDocument.create();
          const [p] = await doc.copyPages(src, [i]);
          doc.addPage(p);
          outs.push({ name: `${name}_page${i + 1}.pdf`, data: await savePdf(doc), type: 'application/pdf' });
        }
      } else {
        const doc = await PDFDocument.create();
        const pages = await doc.copyPages(src, idx);
        pages.forEach((p) => doc.addPage(p));
        outs.push({ name: `${name}_extracted.pdf`, data: await savePdf(doc), type: 'application/pdf' });
      }
      setOut(outs);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (out) return <Result title="Pages extracted" files={out} zipName={`${baseName(file.name)}_pages.zip`} onReset={reset} />;

  return (
    <div class="workspace">
      <div class="panel">
        <PageGrid items={items} selected={selected} onToggle={toggle} />
      </div>
      <aside class="panel sidebar">
        <div class="stat">
          <span>Selected</span>
          <b>
            {selected.size} / {total || '…'}
          </b>
        </div>
        <Field label="Or type pages" hint="e.g. 1, 3-5">
          <input class="input" placeholder="e.g. 1, 3-5" value={ranges} onInput={(e) => applyRanges((e.currentTarget as HTMLInputElement).value)} />
        </Field>
        <div class="row" style={{ gap: 8 }}>
          <button class="btn btn-ghost btn-sm" onClick={() => setSelected(new Set(items.map((i) => i.key)))}>
            Select all
          </button>
          <button class="btn btn-ghost btn-sm" onClick={() => setSelected(new Set())}>
            Clear
          </button>
        </div>
        <Toggle label="One file per page" checked={separate} onChange={setSeparate} />
        {error && <ErrorBox>{error}</ErrorBox>}
        {busy && <Progress label="Extracting…" />}
        <div class="actions">
          <button class="btn btn-accent btn-lg" onClick={run} disabled={busy || selected.size === 0}>
            Extract {selected.size || ''} page{selected.size === 1 ? '' : 's'}
          </button>
        </div>
      </aside>
    </div>
  );
}

export default ExtractPagesTool;
