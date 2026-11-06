import type { ComponentChildren } from 'preact';
import { AlertCircle, Check, Download, RotateCcw } from 'lucide-preact';
import { downloadBlob, formatBytes, toBlob, zipFiles, type OutFile } from '../lib/files';
import { useState } from 'preact/hooks';

export function Field({ label, hint, children }: { label?: string; hint?: string; children: ComponentChildren }) {
  return (
    <div class="field">
      {label && <span class="label">{label}</span>}
      {children}
      {hint && <span class="hint">{hint}</span>}
    </div>
  );
}

export function Seg<T extends string>({ value, onChange, options, full }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; full?: boolean }) {
  return (
    <div class={`seg ${full ? 'full' : ''}`} role="radiogroup">
      {options.map((o) => (
        <button key={o.value} type="button" class={o.value === value ? 'on' : ''} onClick={() => onChange(o.value)} role="radio" aria-checked={o.value === value}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label class="toggle">
      <span class="small">{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange((e.currentTarget as HTMLInputElement).checked)} />
      <span class="track" />
    </label>
  );
}

export function Progress({ value, label }: { value?: number; label?: string }) {
  const indeterminate = value == null;
  return (
    <div class="stack" style={{ gap: 8 }}>
      {label && <span class="muted">{label}</span>}
      <div class={`progress ${indeterminate ? 'indeterminate' : ''}`}>
        <div style={{ width: `${Math.round((value ?? 0) * 100)}%` }} />
      </div>
    </div>
  );
}

export function ErrorBox({ children }: { children: ComponentChildren }) {
  return (
    <div class="alert error" role="alert">
      <AlertCircle size={16} />
      <span>{children}</span>
    </div>
  );
}

export function Note({ children }: { children: ComponentChildren }) {
  return <div class="alert">{children}</div>;
}

/**
 * Result screen: a single file downloads directly; multiple files show a list
 * plus a "Download all (.zip)" button.
 */
export function Result({ title, files, zipName, onReset, note }: { title: string; files: OutFile[]; zipName?: string; onReset: () => void; note?: ComponentChildren }) {
  const [zipping, setZipping] = useState(false);
  const blobs = files.map((f) => ({ f, blob: toBlob(f) }));
  const total = blobs.reduce((s, b) => s + b.blob.size, 0);

  const downloadAll = async () => {
    if (files.length === 1) return downloadBlob(blobs[0].blob, files[0].name);
    setZipping(true);
    try {
      const z = await zipFiles(files, zipName ?? 'taskitbaby.zip');
      downloadBlob(toBlob(z), z.name);
    } finally {
      setZipping(false);
    }
  };

  return (
    <div class="result">
      <div class="icon">
        <Check size={28} strokeWidth={2.5} />
      </div>
      <h2>{title}</h2>
      <p class="muted">
        {files.length === 1 ? files[0].name : `${files.length} files`} · {formatBytes(total)}
      </p>
      {note && <div style={{ maxWidth: 480 }}>{note}</div>}
      <div class="row wrap" style={{ justifyContent: 'center' }}>
        <button class="btn btn-accent btn-lg" onClick={downloadAll} disabled={zipping}>
          <Download size={18} />
          {files.length === 1 ? 'Download' : zipping ? 'Zipping…' : 'Download all (.zip)'}
        </button>
        <button class="btn btn-ghost btn-lg" onClick={onReset}>
          <RotateCcw size={16} />
          Start over
        </button>
      </div>
      {files.length > 1 && (
        <div class="files">
          {blobs.map(({ f, blob }) => (
            <a
              key={f.name}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                downloadBlob(blob, f.name);
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
              <span>{formatBytes(blob.size)}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
