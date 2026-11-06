import { useEffect, useState } from 'preact/hooks';
import { RotateCw } from 'lucide-preact';
import type { Tool, ToolProps } from './types';
import { ErrorBox, Field, Progress, Result, Seg } from '../components/ui';
import { PageGrid, type PageItem } from '../components/PageGrid';
import { degrees, loadPdfLib, savePdf, thumbnails } from '../lib/pdf';
import { baseName, type OutFile } from '../lib/files';

type Angle = '90' | '180' | '270';

function RotateTool({ files, reset }: ToolProps) {
  const file = files[0];
  const [items, setItems] = useState<PageItem[]>([]);
  const [total, setTotal] = useState(0);
  const [angle, setAngle] = useState<Angle>('90');
  const [selected, setSelected] = useState<Set<string>>(new Set());
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

  const all = selected.size === 0;
  const deg = parseInt(angle, 10);

  const toggle = (key: string) =>
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });

  const run = async () => {
    setBusy(true);
    setError(undefined);
    try {
      const doc = await loadPdfLib(file);
      doc.getPages().forEach((p, i) => {
        if (all || selected.has(String(i))) p.setRotation(degrees((p.getRotation().angle + deg) % 360));
      });
      setOut([{ name: `${baseName(file.name)}_rotated.pdf`, data: await savePdf(doc), type: 'application/pdf' }]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (out) return <Result title="PDF rotated" files={out} onReset={reset} />;

  return (
    <div class="workspace">
      <div class="panel">
        <PageGrid items={items.map((it) => ({ ...it, rotation: all || selected.has(it.key) ? deg : 0 }))} selected={selected} onToggle={toggle} />
      </div>
      <aside class="panel sidebar">
        <Field label="Rotate by">
          <Seg
            full
            value={angle}
            onChange={setAngle}
            options={[
              { value: '90', label: '90° ↻' },
              { value: '180', label: '180°' },
              { value: '270', label: '90° ↺' },
            ]}
          />
        </Field>
        <p class="muted">{all ? 'All pages will be rotated. Click pages to rotate only some.' : `${selected.size} selected page${selected.size === 1 ? '' : 's'} will be rotated.`}</p>
        {!all && (
          <button class="btn btn-ghost btn-sm" onClick={() => setSelected(new Set())}>
            Rotate all instead
          </button>
        )}
        {error && <ErrorBox>{error}</ErrorBox>}
        {busy && <Progress label="Rotating…" />}
        <div class="actions">
          <button class="btn btn-accent btn-lg" onClick={run} disabled={busy || !total}>
            Rotate PDF
          </button>
        </div>
      </aside>
    </div>
  );
}

export const rotate: Tool = {
  id: 'rotate-pdf',
  name: 'Rotate PDF',
  description: 'Turn all pages, or just the ones you pick, by 90, 180 or 270 degrees.',
  category: 'edit',
  icon: RotateCw,
  accept: 'application/pdf,.pdf',
  multiple: false,
  component: RotateTool,
};
