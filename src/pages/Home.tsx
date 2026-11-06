import { useMemo, useState } from 'preact/hooks';
import { Lock, Search, Zap, Gift } from 'lucide-preact';
import { TOOLS } from '../tools';
import { CATEGORIES, type Category } from '../tools/types';

type Filter = 'all' | Category;

export function Home() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<Filter>('all');
  const query = q.trim().toLowerCase();

  const visible = useMemo(() => TOOLS.filter((t) => (cat === 'all' || t.category === cat) && (!query || `${t.name} ${t.description}`.toLowerCase().includes(query))), [cat, query]);

  return (
    <div class="container">
      <section class="hero">
        <h1 aria-label="Every PDF tool. Zero uploads.">
          <Words text="Every PDF tool. Zero uploads." from={0} />
        </h1>
        <p>Merge, split, compress, convert and edit PDFs in your browser. Files never leave your device.</p>
        <label class="search">
          <Search size={18} />
          <input type="search" placeholder="Search tools…" value={q} onInput={(e) => setQ((e.currentTarget as HTMLInputElement).value)} autoComplete="off" />
        </label>
      </section>

      <section class="tools" id="tools">
        <div class="chips" role="tablist" aria-label="Filter tools by category">
          <Chip on={cat === 'all'} onClick={() => setCat('all')} label="All" />
          {CATEGORIES.map((c) => (
            <Chip key={c.id} on={cat === c.id} onClick={() => setCat(c.id)} label={c.label} />
          ))}
        </div>

        {visible.length ? (
          <div class="tool-grid">
            {visible.map((t, i) => {
              const Icon = t.icon;
              return (
                <a key={t.id} href={`/${t.id}`} class={`tool-card ${t.soon ? 'soon' : ''}`} aria-disabled={t.soon} style={{ '--i': i } as Record<string, number>}>
                  <div class="icon">
                    <Icon size={19} strokeWidth={1.75} />
                  </div>
                  <div class="body">
                    <h3>{t.name}</h3>
                    <p>{t.description}</p>
                  </div>
                </a>
              );
            })}
          </div>
        ) : (
          <div class="empty">No tool matches “{q}”.</div>
        )}
      </section>

      <section class="why reveal" id="privacy">
        <div class="why-item">
          <Lock size={18} strokeWidth={1.75} />
          <div>
            <h3>Nothing is uploaded</h3>
            <p>Every tool runs inside your browser. Files are never sent to a server, stored, or seen by anyone.</p>
          </div>
        </div>
        <div class="why-item">
          <Zap size={18} strokeWidth={1.75} />
          <div>
            <h3>Instant</h3>
            <p>No upload queues, no waiting for a download link. Most jobs finish in a second or two, even offline.</p>
          </div>
        </div>
        <div class="why-item">
          <Gift size={18} strokeWidth={1.75} />
          <div>
            <h3>Free, no limits</h3>
            <p>No accounts, no watermarks, no daily caps, no file-size tiers.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

/** Each word in its own clipping box so it can rise into view on load. */
function Words({ text, from }: { text: string; from: number }) {
  return (
    <>
      {text.split(' ').map((w, i) => (
        <span class="w" aria-hidden="true" key={w + i}>
          <span style={{ '--j': from + i } as Record<string, number>}>{w}</span>
        </span>
      ))}
    </>
  );
}

function Chip({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button type="button" class={`chip ${on ? 'on' : ''}`} onClick={onClick} role="tab" aria-selected={on}>
      {label}
    </button>
  );
}
