import { useEffect, useState } from 'preact/hooks';
import type { ToolProps } from './types';
import { ErrorBox, Field, Progress, Result, Seg } from '../components/ui';
import { PageGrid, type PageItem } from '../components/PageGrid';
import { closePdfJs, openPdfJs, renderPages, thumbnails } from '../lib/pdf';
import { baseName, type OutFile } from '../lib/files';

type Fmt = 'jpg' | 'png';
type Dpi = '72' | '150' | '300';

function PdfToImageTool({ files, reset }: ToolProps) {
  const file = files[0];
  const [items, setItems] = useState<PageItem[]>([]);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [fmt, setFmt] = useState<Fmt>('jpg');
  const [dpi, setDpi] = useState<Dpi>('150');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number>();
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

  const run = async () => {
    setBusy(true);
    setError(undefined);
    setProgress(0);
    try {
      const doc = await openPdfJs(file);
      const indices = selected.size ? [...selected].map(Number).sort((a, b) => a - b) : undefined;
      const name = baseName(file.name);
      const outs: OutFile[] = [];
      const count = indices?.length ?? doc.numPages;
      await renderPages(doc, {
        scale: parseInt(dpi, 10) / 72,
        indices,
        type: fmt === 'png' ? 'image/png' : 'image/jpeg',
        quality: 0.9,
        onPage: (p) => {
          const b64 = p.url.split(',')[1];
          const bin = atob(b64);
          const bytes = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
          outs.push({ name: `${name}_page${p.index + 1}.${fmt}`, data: bytes, type: fmt === 'png' ? 'image/png' : 'image/jpeg' });
          setProgress(outs.length / count);
        },
      });
      await closePdfJs(doc);
      setOut(outs);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (out) return <Result title="Images ready" files={out} zipName={`${baseName(file.name)}_images.zip`} onReset={reset} />;

  return (
    <div class="workspace">
      <div class="panel">
        <PageGrid items={items} selected={selected} onToggle={toggle} />
      </div>
      <aside class="panel sidebar">
        <Field label="Format">
          <Seg
            full
            value={fmt}
            onChange={setFmt}
            options={[
              { value: 'jpg', label: 'JPG' },
              { value: 'png', label: 'PNG' },
            ]}
          />
        </Field>
        <Field label="Quality" hint={dpi === '72' ? 'Screen size' : dpi === '150' ? 'Good for sharing' : 'Print quality, large files'}>
          <Seg
            full
            value={dpi}
            onChange={setDpi}
            options={[
              { value: '72', label: 'Low' },
              { value: '150', label: 'Medium' },
              { value: '300', label: 'High' },
            ]}
          />
        </Field>
        <p class="muted">{selected.size ? `${selected.size} selected page${selected.size === 1 ? '' : 's'} will be converted.` : 'All pages will be converted. Click pages to pick only some.'}</p>
        {error && <ErrorBox>{error}</ErrorBox>}
        {busy && <Progress value={progress} label="Rendering…" />}
        <div class="actions">
          <button class="btn btn-accent btn-lg" onClick={run} disabled={busy || !total}>
            Convert to {fmt.toUpperCase()}
          </button>
        </div>
      </aside>
    </div>
  );
}

export default PdfToImageTool;
