import type { ComponentChildren, ComponentType } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { LocationProvider as IsoLocationProvider, Router, Route, useLocation } from 'preact-iso';
import { ShieldCheck } from 'lucide-preact';
import { Home } from './pages/Home';
import { ToolPage } from './pages/ToolPage';

// preact-iso accepts a `url` prop for pre-rendering but doesn't type it.
const LocationProvider = IsoLocationProvider as unknown as ComponentType<{ url?: string; children?: ComponentChildren }>;

function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    addEventListener('scroll', on, { passive: true });
    return () => removeEventListener('scroll', on);
  }, []);

  return (
    <header class={`site-header ${scrolled ? 'scrolled' : ''}`}>
      <div class="container">
        <a href="/" class="brand" aria-label="Taskitbaby home">
          <span class="brand-mark">T</span>
          <span class="brand-name">Taskitbaby</span>
        </a>
        <nav class="header-nav">
          <a href="/#tools" class="nav-link">
            All tools
          </a>
          <a href="/#privacy" class="nav-link">
            Privacy
          </a>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer class="site-footer">
      <div class="container">
        <span class="row" style={{ gap: 6 }}>
          <ShieldCheck size={14} />
          Files are processed on your device and never uploaded.
        </span>
        <span>© {new Date().getFullYear()} Taskitbaby</span>
      </div>
    </footer>
  );
}

function NotFound() {
  return (
    <div class="container">
      <div class="empty">
        <h2>Page not found</h2>
        <p style={{ marginTop: 8 }}>
          <a href="/" style={{ color: 'var(--text)', textDecoration: 'underline' }}>
            Back to all tools
          </a>
        </p>
      </div>
    </div>
  );
}

/**
 * On each route change: scroll to the top (unless the URL has a hash) and
 * start revealing `.reveal` sections as they enter the viewport.
 */
function RouteEffects() {
  const { path, url } = useLocation();
  useEffect(() => {
    if (!url.includes('#')) window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal:not(.in)'));
    if (!('IntersectionObserver' in window)) {
      els.forEach((e) => e.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting) {
            en.target.classList.add('in');
            io.unobserve(en.target);
          }
        }
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.06 },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [path]);
  return null;
}

export function App({ url }: { url?: string }) {
  return (
    <LocationProvider url={url}>
      <Header />
      <main class="site-main">
        <RouteEffects />
        <Router>
          <Route path="/" component={Home} />
          <Route path="/:toolId" component={ToolPage} />
          <Route default component={NotFound} />
        </Router>
      </main>
      <Footer />
    </LocationProvider>
  );
}
