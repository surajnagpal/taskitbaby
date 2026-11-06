import { useMemo, useState } from 'preact/hooks';
import { Lock, Search, Zap, Gift } from 'lucide-preact';
import { TOOLS } from '../tools';
import { CATEGORIES } from '../tools/types';

export function Home() {
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();

  const filtered = useMemo(() => (query ? TOOLS.filter((t) => `${t.name} ${t.description}`.toLowerCase().includes(query)) : TOOLS), [query]);

  return (
    <div class="container">
      <section class="hero">
        <h1>
          Every PDF tool you need, <span class="grad">right in your browser.</span>
        </h1>
        <p>Merge, split, compress, convert and edit PDFs in seconds. Your files are processed on your device and never leave it.</p>
        <label class="search">
          <Search size={17} />
          <input type="search" placeholder="Search tools…" value={q} onInput={(e) => setQ((e.currentTarget as HTMLInputElement).value)} autoComplete="off" />
        </label>
      </section>

      <div id="tools" />
      {query ? (
        <section class="section">
          <div class="section-title">
            {filtered.length} result{filtered.length === 1 ? '' : 's'}
          </div>
          {filtered.length ? <Grid tools={filtered} /> : <div class="empty">No tool matches “{q}”.</div>}
        </section>
      ) : (
        CATEGORIES.map((c) => {
          const tools = TOOLS.filter((t) => t.category === c.id);
          if (!tools.length) return null;
          return (
            <section class="section" key={c.id}>
              <div class="section-title">{c.label}</div>
              <Grid tools={tools} />
            </section>
          );
        })
      )}

      <section class="section" id="privacy" style={{ marginTop: 64 }}>
        <div class="section-title">Why Taskitbaby</div>
        <div class="tool-grid">
          <div class="tool-card" style={{ transform: 'none' }}>
            <div class="icon">
              <Lock size={18} />
            </div>
            <h3>Private by design</h3>
            <p>Everything runs inside your browser. Files are never uploaded, stored or seen by anyone.</p>
          </div>
          <div class="tool-card" style={{ transform: 'none' }}>
            <div class="icon">
              <Zap size={18} />
            </div>
            <h3>Instant</h3>
            <p>No upload or download queues. Most tasks finish in a second or two, even offline.</p>
          </div>
          <div class="tool-card" style={{ transform: 'none' }}>
            <div class="icon">
              <Gift size={18} />
            </div>
            <h3>Free, no limits</h3>
            <p>No accounts, no watermarks, no daily caps. Use every tool as often as you like.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function Grid({ tools }: { tools: typeof TOOLS }) {
  return (
    <div class="tool-grid">
      {tools.map((t) => {
        const Icon = t.icon;
        return (
          <a key={t.id} href={`/${t.id}`} class={`tool-card ${t.soon ? 'soon' : ''}`} aria-disabled={t.soon}>
            <div class="row">
              <div class="icon">
                <Icon size={18} />
              </div>
              {t.soon && <span class="soon-tag">Soon</span>}
            </div>
            <div>
              <h3>{t.name}</h3>
              <p>{t.description}</p>
            </div>
          </a>
        );
      })}
    </div>
  );
}
