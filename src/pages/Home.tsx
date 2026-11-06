import { useMemo, useState } from 'preact/hooks';
import { Lock, Search, Zap, Gift } from 'lucide-preact';
import { TOOLS } from '../tools';
import { CATEGORIES } from '../tools/types';

export function Home() {
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();

  const filtered = useMemo(() => (query ? TOOLS.filter((t) => `${t.name} ${t.description}`.toLowerCase().includes(query)) : TOOLS), [query]);

  return (
    <>
      <section class="hero">
        <div class="hero-art" aria-hidden="true">
          <img
            src="/art/hero-1400.jpg"
            srcset="/art/hero-800.jpg 800w, /art/hero-1400.jpg 1400w, /art/hero-2400.jpg 2400w, /art/hero-3600.jpg 3600w"
            sizes="100vw"
            alt=""
            fetchpriority="high"
            decoding="async"
          />
        </div>
        <div class="container">
          <div class="hero-card">
            <h1>Every PDF tool you need. Nothing leaves your device.</h1>
            <p>Merge, split, compress, convert and edit PDFs in your browser. No upload, no account, no limits.</p>
            <label class="search">
              <Search size={17} />
              <input type="search" placeholder="Search tools…" value={q} onInput={(e) => setQ((e.currentTarget as HTMLInputElement).value)} autoComplete="off" />
            </label>
          </div>
        </div>
      </section>

      <div class="container">
        <div id="tools" />
        {query ? (
          <section class="section">
            <SectionHead title={`${filtered.length} result${filtered.length === 1 ? '' : 's'}`} />
            {filtered.length ? <Grid tools={filtered} /> : <div class="empty">No tool matches “{q}”.</div>}
          </section>
        ) : (
          CATEGORIES.map((c) => {
            const tools = TOOLS.filter((t) => t.category === c.id);
            if (!tools.length) return null;
            return (
              <section class="section" key={c.id}>
                <SectionHead title={c.label} count={tools.length} />
                <Grid tools={tools} />
              </section>
            );
          })
        )}

        <section class="section why" id="privacy">
          <SectionHead title="Why Taskitbaby" />
          <div class="tool-grid">
            <div class="tool-card static">
              <div class="icon">
                <Lock size={18} />
              </div>
              <h3>Private by design</h3>
              <p>Everything runs inside your browser. Files are never uploaded, stored or seen by anyone.</p>
            </div>
            <div class="tool-card static">
              <div class="icon">
                <Zap size={18} />
              </div>
              <h3>Instant</h3>
              <p>No upload or download queues. Most tasks finish in a second or two, even offline.</p>
            </div>
            <div class="tool-card static">
              <div class="icon">
                <Gift size={18} />
              </div>
              <h3>Free, no limits</h3>
              <p>No accounts, no watermarks, no daily caps. Use every tool as often as you like.</p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function SectionHead({ title, count }: { title: string; count?: number }) {
  return (
    <div class="section-head">
      <h2>{title}</h2>
      {count != null && <span class="count">{count}</span>}
      <span class="rule" />
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
