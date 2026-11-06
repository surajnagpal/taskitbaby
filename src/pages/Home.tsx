import { useMemo, useState } from 'preact/hooks';
import { ArrowRight, Lock, Search, Zap, Gift } from 'lucide-preact';

function GithubMark({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2.17c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}
import { TOOLS } from '../tools';
import { CATEGORIES, type Category } from '../tools/types';

type Filter = 'all' | Category;

export function Home() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<Filter>('all');
  const query = q.trim().toLowerCase();

  const visible = useMemo(() => TOOLS.filter((t) => (cat === 'all' || t.category === cat) && (!query || `${t.name} ${t.description}`.toLowerCase().includes(query))), [cat, query]);

  const counts = useMemo(() => {
    const m: Record<string, number> = { all: TOOLS.length };
    for (const c of CATEGORIES) m[c.id] = TOOLS.filter((t) => t.category === c.id).length;
    return m;
  }, []);

  return (
    <div class="container">
      {/* ---------- Hero ---------- */}
      <section class="hero">
        <div class="hero-copy">
          <span class="eyebrow">Private by design</span>
          <h1>
            Every PDF tool.
            <br />
            Zero uploads.
          </h1>
          <p>Merge, split, compress, convert and edit PDFs right in your browser. Your files never leave your device: no account, no limits, no waiting.</p>
          <label class="search">
            <Search size={18} />
            <input type="search" placeholder="Search tools…" value={q} onInput={(e) => setQ((e.currentTarget as HTMLInputElement).value)} autoComplete="off" />
          </label>
          <div class="hero-meta">
            <span>{TOOLS.length} tools</span>
            <span class="sep" />
            <span>Free, forever</span>
            <span class="sep" />
            <a href="https://github.com/surajnagpal/taskitbaby" target="_blank" rel="noopener">
              <GithubMark /> Open source
            </a>
          </div>
        </div>
        <figure class="hero-figure">
          <img
            src="/art/hero-1400.jpg"
            srcset="/art/hero-800.jpg 800w, /art/hero-1400.jpg 1400w, /art/hero-2000.jpg 2000w"
            sizes="(max-width: 900px) 100vw, 50vw"
            alt="Raphael’s The School of Athens: philosophers gathered beneath a grand arch"
            fetchpriority="high"
            decoding="async"
          />
          <figcaption>Raphael, The School of Athens, 1511</figcaption>
        </figure>
      </section>

      {/* ---------- Tools ---------- */}
      <section class="tools" id="tools">
        <div class="tools-head">
          <h2>All tools</h2>
          <div class="chips" role="tablist" aria-label="Filter tools by category">
            <Chip on={cat === 'all'} onClick={() => setCat('all')} label="All" count={counts.all} />
            {CATEGORIES.map((c) => (
              <Chip key={c.id} on={cat === c.id} onClick={() => setCat(c.id)} label={c.label} count={counts[c.id]} />
            ))}
          </div>
        </div>

        {visible.length ? (
          <div class="tool-grid">
            {visible.map((t) => {
              const Icon = t.icon;
              return (
                <a key={t.id} href={`/${t.id}`} class={`tool-card ${t.soon ? 'soon' : ''}`} aria-disabled={t.soon}>
                  <div class="icon">
                    <Icon size={19} strokeWidth={1.75} />
                  </div>
                  <div class="body">
                    <h3>{t.name}</h3>
                    <p>{t.description}</p>
                  </div>
                  <span class="go">
                    <ArrowRight size={16} />
                  </span>
                </a>
              );
            })}
          </div>
        ) : (
          <div class="empty">No tool matches “{q}”.</div>
        )}
      </section>

      {/* ---------- Why ---------- */}
      <section class="why" id="privacy">
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
            <h3>Instant results</h3>
            <p>No upload queues and no waiting for a download link. Most jobs finish in a second or two, even offline.</p>
          </div>
        </div>
        <div class="why-item">
          <Gift size={18} strokeWidth={1.75} />
          <div>
            <h3>Free without limits</h3>
            <p>No accounts, no watermarks, no daily caps, no file-size tiers. Use every tool as often as you like.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function Chip({ on, onClick, label, count }: { on: boolean; onClick: () => void; label: string; count?: number }) {
  return (
    <button type="button" class={`chip ${on ? 'on' : ''}`} onClick={onClick} role="tab" aria-selected={on}>
      {label}
      {count != null && <span class="n">{count}</span>}
    </button>
  );
}
