import type { ComponentChildren, ComponentType } from 'preact';
import { useEffect } from 'preact/hooks';
import { LocationProvider as IsoLocationProvider, Router, Route, useLocation } from 'preact-iso';
import { ShieldCheck } from 'lucide-preact';
import { Home } from './pages/Home';
import { ToolPage } from './pages/ToolPage';

// preact-iso accepts a `url` prop for pre-rendering but doesn't type it.
const LocationProvider = IsoLocationProvider as unknown as ComponentType<{ url?: string; children?: ComponentChildren }>;

function Header() {
  return (
    <header class="site-header">
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
        <span class="credit">Artwork: Raphael, The School of Athens (1509–1511), public domain.</span>
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

/** Scroll to the top on route change unless the URL targets an anchor. */
function ScrollToTop() {
  const { path, url } = useLocation();
  useEffect(() => {
    if (!url.includes('#')) window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [path]);
  return null;
}

export function App({ url }: { url?: string }) {
  return (
    <LocationProvider url={url}>
      <Header />
      <main class="site-main">
        <ScrollToTop />
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
