import type { ComponentChildren, ComponentType } from 'preact';
import { useEffect } from 'preact/hooks';
import { LocationProvider as IsoLocationProvider, Router, Route, useLocation } from 'preact-iso';
import { Home } from './pages/Home';
import { ToolPage } from './pages/ToolPage';

// preact-iso accepts a `url` prop for pre-rendering but doesn't type it.
const LocationProvider = IsoLocationProvider as unknown as ComponentType<{ url?: string; children?: ComponentChildren }>;

function Header() {
  return (
    <header class="site-header">
      <div class="container">
        <a href="/" class="brand" aria-label="pdfitbaby home">
          <img class="brand-logo" src="/logo.png" alt="pdfitbaby" width="44" height="40" decoding="async" />
        </a>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer class="site-footer">
      <div class="container">
        <span>© {new Date().getFullYear()} pdfitbaby</span>
        <span>Files are processed on your device and never uploaded.</span>
      </div>
    </footer>
  );
}

function NotFound() {
  return (
    <div class="container tool-page">
      <div class="empty">
        <h2>Page not found</h2>
        <p style={{ marginTop: 8 }}>
          <a href="/" style={{ textDecoration: 'underline' }}>
            Back to all tools
          </a>
        </p>
      </div>
    </div>
  );
}

const reduceMotion = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Inertial smooth scrolling (Lenis), the same technique design studios use.
 * Loaded on demand so it never touches the pre-render or the first paint.
 */
function SmoothScroll() {
  useEffect(() => {
    if (reduceMotion()) return;
    let stop = false;
    let raf = 0;
    let lenis: { raf: (t: number) => void; destroy: () => void } | null = null;
    import('lenis').then(({ default: Lenis }) => {
      if (stop) return;
      lenis = new Lenis({ lerp: 0.16, wheelMultiplier: 1.35, smoothWheel: true });
      const loop = (t: number) => {
        lenis?.raf(t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    });
    return () => {
      stop = true;
      cancelAnimationFrame(raf);
      lenis?.destroy();
    };
  }, []);
  return null;
}

/**
 * On each route change: scroll to the top (unless the URL has a hash) and
 * reveal `.reveal` elements as they enter the viewport. `html.js` is set by
 * an inline script before first paint, so without JavaScript everything is
 * simply visible.
 */
function RouteEffects() {
  const { path, url } = useLocation();
  useEffect(() => {
    if (!url.includes('#')) window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal:not(.in)'));
    if (!els.length) return;
    if (!('IntersectionObserver' in window) || reduceMotion()) {
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
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
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
        <SmoothScroll />
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
