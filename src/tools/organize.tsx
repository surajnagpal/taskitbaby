import { useEffect, useState } from 'preact/hooks';
import type { ToolProps } from './types';
import { ErrorBox, Progress, Result } from '../components/ui';
import { PageGrid, type PageItem } from '../components/PageGrid';
import { PDFDocument, degrees, loadPdfLib, savePdf, thumbnails } from '../lib/pdf';
import { baseName, type OutFile } from '../lib/files';

function OrganizeTool({ files, reset }: ToolProps) {
  const file = files[0];
  const [items, setItems] = useState<PageItem[]>([]);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [out, setOut] = useState<OutFile[]>();

  useEffect(() => {
    let alive = true;
    thumbnails(file, { targetWidth: 200, onPage: (p) => alive && setItems((prev) => [...prev, { key: String(p.index), page: p, rotation: 0 }]) })
      .then((r) => alive && setTotal(r.total))
      .catch((e) => setError((e as Error).message));
    return () => {
      alive = false;
    };
  }, [file]);

  const reorder = (from: number, to: number) =>
    setItems((prev) => {
      const n = [...prev];
      const [it] = n.splice(from, 1);
      n.splice(to, 0, it);
      return n;
    });

  const rotate = (key: string) => setItems((prev) => prev.map((it) => (it.key === key ? { ...it, rotation: ((it.rotation ?? 0) + 90) % 360 } : it)));
  const remove = (key: string) => setItems((prev) => prev.map((it) => (it.key === key ? { ...it, removed: !it.removed } : it)));

  const kept = items.filter((i) => !i.removed);
  const changed = items.some((i, idx) => i.removed || (i.rotation ?? 0) !== 0 || Number(i.key) !== idx);

  const run = async () => {
    setBusy(true);
    setError(undefined);
    try {
      const src = await loadPdfLib(file);
      const doc = await PDFDocument.create();
      const idx = kept.map((i) => Number(i.key));
      const pages = await doc.copyPages(src, idx);
      pages.forEach((p, k) => {
        const extra = kept[k].rotation ?? 0;
        if (extra) p.setRotation(degrees((p.getRotation().angle + extra) % 360));
        doc.addPage(p);
      });
      setOut([{ name: `${baseName(file.name)}_organized.pdf`, data: await savePdf(doc), type: 'application/pdf' }]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (out) return <Result title="PDF organized" files={out} onReset={reset} />;

  return (
    <div class="workspace">
      <div class="panel">
        <PageGrid items={items} onReorder={reorder} onRotate={rotate} onRemove={remove} />
      </div>
      <aside class="panel sidebar">
        <div class="stat">
          <span>Pages</span>
          <b>
            {kept.length} / {total || '…'}
          </b>
        </div>
        <p class="muted">Drag pages to reorder. Hover a page to rotate or remove it.</p>
        <div class="row" style={{ gap: 8 }}>
          <button class="btn btn-ghost btn-sm" onClick={() => setItems((p) => [...p].reverse())}>
            Reverse order
          </button>
          <button class="btn btn-ghost btn-sm" onClick={() => setItems((p) => [...p].sort((a, b) => Number(a.key) - Number(b.key)).map((i) => ({ ...i, rotation: 0, removed: false })))}>
            Reset
          </button>
        </div>
        {error && <ErrorBox>{error}</ErrorBox>}
        {busy && <Progress label="Saving…" />}
        <div class="actions">
          <button class="btn btn-accent btn-lg" onClick={run} disabled={busy || !total || kept.length === 0 || !changed}>
            Save PDF
          </button>
          {!changed && total > 0 && <span class="muted">No changes yet.</span>}
        </div>
      </aside>
    </div>
  );
}

export default OrganizeTool;
