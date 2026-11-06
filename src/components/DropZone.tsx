import { useState } from 'preact/hooks';
import { Upload } from 'lucide-preact';

export function DropZone({ accept, multiple, hint, onFiles, compact }: { accept: string; multiple: boolean; hint?: string; onFiles: (files: File[]) => void; compact?: boolean }) {
  const [over, setOver] = useState(false);

  const accepts = accept
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const filter = (list: FileList | File[]) => {
    const files = Array.from(list).filter((f) => {
      if (accepts.length === 0) return true;
      const name = f.name.toLowerCase();
      const type = f.type.toLowerCase();
      return accepts.some((a) => (a.startsWith('.') ? name.endsWith(a) : a.endsWith('/*') ? type.startsWith(a.slice(0, -1)) : type === a));
    });
    return multiple ? files : files.slice(0, 1);
  };

  return (
    <label
      class={`dropzone ${over ? 'over' : ''}`}
      style={compact ? { minHeight: 120, padding: '20px 16px', gap: 8 } : undefined}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (e.dataTransfer?.files?.length) onFiles(filter(e.dataTransfer.files));
      }}
    >
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => {
          const el = e.currentTarget as HTMLInputElement;
          if (el.files?.length) onFiles(filter(el.files));
          el.value = '';
        }}
      />
      {!compact && (
        <div class="icon">
          <Upload size={24} />
        </div>
      )}
      <h2 style={compact ? { fontSize: 14 } : undefined}>{compact ? 'Add more files' : multiple ? 'Drop files here' : 'Drop a file here'}</h2>
      <p>{hint ?? 'or click to choose from your device'}</p>
    </label>
  );
}
