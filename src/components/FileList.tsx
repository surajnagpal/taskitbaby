import { GripVertical, X } from 'lucide-preact';
import { useEffect, useState } from 'preact/hooks';
import { formatBytes } from '../lib/files';
import { thumbnails } from '../lib/pdf';

interface Entry {
  file: File;
  thumb?: string;
  pages?: number;
}

/** Ordered list of input files with thumbnails, drag re-ordering and removal. */
export function FileList({ files, onChange, showThumbs = true }: { files: File[]; onChange: (files: File[]) => void; showThumbs?: boolean }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    setEntries((prev) =>
      files.map((f) => prev.find((e) => e.file === f) ?? { file: f }),
    );
    if (!showThumbs) return;
    (async () => {
      for (const f of files) {
        if (!alive) return;
        if (entries.find((e) => e.file === f && e.thumb)) continue;
        try {
          if (f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')) {
            const { pages, total } = await thumbnails(f, { max: 1, targetWidth: 120 });
            if (!alive) return;
            setEntries((prev) => prev.map((e) => (e.file === f ? { ...e, thumb: pages[0]?.url, pages: total } : e)));
          } else if (f.type.startsWith('image/')) {
            const url = URL.createObjectURL(f);
            setEntries((prev) => prev.map((e) => (e.file === f ? { ...e, thumb: url } : e)));
          }
        } catch {
          /* leave without thumbnail */
        }
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  const move = (from: number, to: number) => {
    const next = [...files];
    const [f] = next.splice(from, 1);
    next.splice(to, 0, f);
    onChange(next);
  };

  return (
    <div class="file-list">
      {files.map((f, idx) => {
        const e = entries.find((x) => x.file === f);
        return (
          <div
            key={`${f.name}-${f.size}-${f.lastModified}-${idx}`}
            class={`file-item ${dragIdx === idx ? 'dragging' : ''}`}
            draggable={files.length > 1}
            onDragStart={(ev) => {
              setDragIdx(idx);
              ev.dataTransfer!.effectAllowed = 'move';
            }}
            onDragOver={(ev) => {
              if (dragIdx != null) ev.preventDefault();
            }}
            onDrop={(ev) => {
              ev.preventDefault();
              if (dragIdx != null && dragIdx !== idx) move(dragIdx, idx);
              setDragIdx(null);
            }}
            onDragEnd={() => setDragIdx(null)}
          >
            {files.length > 1 && (
              <span class="grip">
                <GripVertical size={16} />
              </span>
            )}
            {showThumbs && (e?.thumb ? <img class="thumb" src={e.thumb} alt="" /> : <div class="thumb" />)}
            <div class="meta">
              <div class="name" title={f.name}>
                {f.name}
              </div>
              <div class="sub">
                {formatBytes(f.size)}
                {e?.pages ? ` · ${e.pages} page${e.pages === 1 ? '' : 's'}` : ''}
              </div>
            </div>
            <button class="btn btn-icon" title="Remove" onClick={() => onChange(files.filter((_, i) => i !== idx))}>
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
