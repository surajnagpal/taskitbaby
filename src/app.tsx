import { LocationProvider, Router, Route, useLocation } from 'preact-iso';
import { FileText, ShieldCheck } from 'lucide-preact';
import { Home } from './pages/Home';
import { ToolPage } from './pages/ToolPage';

function Header() {
  return (
    <header class="site-header">
      <div class="container">
        <a href="/" class="brand" aria-label="Taskitbaby home">
          <span class="brand-mark">
            <FileText size={15} strokeWidth={2.5} />
          </span>
          Taskitbaby
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
          <a href="/" style={{ color: 'var(--accent)' }}>
            Back to all tools
          </a>
        </p>
      </div>
    </div>
  );
}

function ScrollToTop() {
  const { path } = useLocation();
  // scroll on route change
  if (typeof window !== 'undefined') {
    queueMicrotask(() => window.scrollTo({ top: 0 }));
  }
  void path;
  return null;
}

export function App() {
  return (
    <LocationProvider>
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
