import { useEffect, useState } from 'preact/hooks';
import { ChevronLeft, ChevronRight, X } from 'lucide-preact';
import { toBlob, type OutFile } from '../lib/files';
import { closePdfJs, openPdfJs, renderPages, type RenderedPage } from '../lib/pdf';

const THUMBS = 12;

type State = 'loading' | 'ready' | 'locked' | 'none' | 'error';

function kind(f: OutFile): 'pdf' | 'image' | 'other' {
  const t = toBlob(f).type;
  if (t === 'application/pdf' || /\.pdf$/i.test(f.name)) return 'pdf';
  if (t.startsWith('image/') || /\.(jpe?g|png|webp|gif)$/i.test(f.name)) return 'image';
  return 'other';
}

/**
 * Shows the finished output before download: a strip of page thumbnails,
 * a file switcher when there are several outputs, and a lightbox for any
 * page. Everything is rendered locally from the output bytes.
 */
export function Preview({ files }: { files: OutFile[] }) {
  const [idx, setIdx] = useState(0);
  const [pages, setPages] = useState<RenderedPage[]>([]);
  const [total, setTotal] = useState(0);
  const [state, setState] = useState<State>('loading');
  const [open, setOpen] = useState<number | null>(null);
  const [big, setBig] = useState<string | null>(null);

  const file = files[Math.min(idx, files.length - 1)];
  const k = kind(file);

  // thumbnails
  useEffect(() => {
    let alive = true;
    setPages([]);
    setTotal(0);
    setOpen(null);
    setBig(null);
    const blob = toBlob(file);

    if (k === 'image') {
      const url = URL.createObjectURL(blob);
      setPages([{ index: 0, width: 0, height: 0, url }]);
      setTotal(1);
      setState('ready');
      return () => URL.revokeObjectURL(url);
    }
    if (k !== 'pdf') {
      setState('none');
      return;
    }
    setState('loading');
    (async () => {
      try {
        const doc = await openPdfJs(await blob.arrayBuffer());
        if (!alive) {
          await closePdfJs(doc);
          return;
        }
        setTotal(doc.numPages);
        const n = Math.min(doc.numPages, THUMBS);
        await renderPages(doc, {
          targetWidth: 300,
          quality: 0.75,
          indices: Array.from({ length: n }, (_, i) => i),
          onPage: (p) => alive && setPages((prev) => [...prev, p]),
        });
        await closePdfJs(doc);
        if (alive) setState('ready');
      } catch (e) {
        if (!alive) return;
        setState((e as Error)?.name === 'PdfPasswordError' ? 'locked' : 'error');
      }
    })();
    return () => {
      alive = false;
    };
  }, [file, k]);

  // lightbox: render the chosen page large, on demand
  useEffect(() => {
    if (open == null) return;
    let alive = true;
    setBig(null);
    if (k === 'image') {
      setBig(pages[0]?.url ?? null);
      return;
    }
    (async () => {
      try {
        const doc = await openPdfJs(await toBlob(file).arrayBuffer());
        const [p] = await renderPages(doc, { targetWidth: Math.min(1600, Math.round(window.innerWidth * 1.5)), quality: 0.9, indices: [open] });
        await closePdfJs(doc);
        if (alive) setBig(p.url);
      } catch {
        if (alive) setBig(pages[open]?.url ?? null);
      }
    })();
    return () => {
      alive = false;
    };
  }, [open, file, k]);

  // keyboard for the lightbox
  useEffect(() => {
    if (open == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight' && open < total - 1) setOpen(open + 1);
      if (e.key === 'ArrowLeft' && open > 0) setOpen(open - 1);
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [open, total]);

  if (state === 'none') return null;

  return (
    <div class="preview">
      {files.length > 1 && (
        <div class="preview-files" role="tablist" aria-label="Preview file">
          {files.map((f, i) => (
            <button key={f.name} type="button" role="tab" aria-selected={i === idx} class={`chip ${i === idx ? 'on' : ''}`} onClick={() => setIdx(i)}>
              {f.name}
            </button>
          ))}
        </div>
      )}

      {state === 'locked' && <p class="muted">Preview isn’t available for password-protected files. Open the download with your password to check it.</p>}
      {state === 'error' && <p class="muted">Preview couldn’t be generated, but the file is ready to download.</p>}

      {(state === 'loading' || state === 'ready') && (
        <>
          <div class="preview-strip" data-lenis-prevent>
            {pages.map((p, i) => (
              <button key={p.index} type="button" class="preview-page" onClick={() => setOpen(p.index)} title={k === 'pdf' ? `Open page ${p.index + 1}` : 'Open image'}>
                <img src={p.url} alt={k === 'pdf' ? `Page ${p.index + 1}` : file.name} loading="lazy" />
                {k === 'pdf' && <span>{i + 1}</span>}
              </button>
            ))}
            {state === 'loading' &&
              Array.from({ length: Math.max(0, Math.min(total || 3, THUMBS) - pages.length) }, (_, i) => <div key={`s${i}`} class="preview-page skeleton" />)}
          </div>
          {k === 'pdf' && total > 0 && (
            <p class="muted">
              {total > THUMBS ? `Showing the first ${THUMBS} of ${total} pages.` : `${total} page${total === 1 ? '' : 's'}.`} Click a page to enlarge.
            </p>
          )}
        </>
      )}

      {open != null && (
        <div class="lightbox" data-lenis-prevent onClick={() => setOpen(null)} role="dialog" aria-label="Page preview">
          <button type="button" class="lb-close" aria-label="Close" onClick={() => setOpen(null)}>
            <X size={20} />
          </button>
          {k === 'pdf' && open > 0 && (
            <button
              type="button"
              class="lb-nav prev"
              aria-label="Previous page"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(open - 1);
              }}
            >
              <ChevronLeft size={22} />
            </button>
          )}
          <div class="lb-stage" onClick={(e) => e.stopPropagation()}>
            {big ? <img src={big} alt={k === 'pdf' ? `Page ${open + 1}` : file.name} /> : <div class="progress indeterminate" style={{ width: 200 }}><div /></div>}
            {k === 'pdf' && (
              <span class="lb-caption">
                Page {open + 1} of {total}
              </span>
            )}
          </div>
          {k === 'pdf' && open < total - 1 && (
            <button
              type="button"
              class="lb-nav next"
              aria-label="Next page"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(open + 1);
              }}
            >
              <ChevronRight size={22} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
