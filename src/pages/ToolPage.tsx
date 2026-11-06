import { useEffect, useState } from 'preact/hooks';
import { ArrowLeft, ShieldCheck } from 'lucide-preact';
import { useRoute } from 'preact-iso';
import { TOOLS } from '../tools';
import type { ToolComponent } from '../tools/types';
import { TOOL_SEO } from '../seo/content';
import { SITE_NAME } from '../seo/site';
import { DropZone } from '../components/DropZone';

export function ToolPage() {
  const { params } = useRoute();
  // Pre-rendered pages are served as /<id>.html by some hosts; accept both.
  const toolId = (params.toolId ?? '').replace(/\.html$/, '');
  const tool = TOOLS.find((t) => t.id === toolId);
  const seo = tool ? TOOL_SEO[tool.id] : undefined;
  const [files, setFiles] = useState<File[]>([]);
  const [Body, setBody] = useState<ToolComponent | null>(null);
  const [loadError, setLoadError] = useState<string>();

  useEffect(() => {
    document.title = tool ? `${tool.name} · ${SITE_NAME}` : SITE_NAME;
  }, [tool, seo]);

  // Reset state and preload the tool's UI when switching tools.
  useEffect(() => {
    setFiles([]);
    setBody(null);
    setLoadError(undefined);
    if (!tool) return;
    let alive = true;
    tool
      .load()
      .then((c) => alive && setBody(() => c))
      .catch((e) => alive && setLoadError((e as Error).message));
    return () => {
      alive = false;
    };
  }, [tool?.id]);

  if (!tool) {
    return (
      <div class="container tool-page">
        <div class="empty">
          <h2>Tool not found</h2>
          <p style={{ marginTop: 8 }}>
            <a href="/" style={{ color: 'var(--accent)' }}>
              Back to all tools
            </a>
          </p>
        </div>
      </div>
    );
  }

  const related = TOOLS.filter((t) => t.id !== tool.id && t.category === tool.category).concat(TOOLS.filter((t) => t.id !== tool.id && t.category !== tool.category)).slice(0, 6);

  return (
    <div class="container tool-page">
      <div class="tool-head">
        <a href="/" class="back">
          <ArrowLeft size={14} /> All tools
        </a>
        <h1>{tool.name}</h1>
        <p>{tool.description}</p>
      </div>

      {files.length === 0 ? (
        <>
          <DropZone accept={tool.accept} multiple={tool.multiple} hint={tool.hint} onFiles={(f) => f.length && setFiles(f)} />
          <div class="privacy">
            <ShieldCheck size={15} />
            Processed on your device. Nothing is uploaded.
          </div>

          {seo && (
            <section class="seo">
              <div>
                <h2>{seo.howToTitle}</h2>
                <ol class="steps">
                  {seo.howTo.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              </div>
              <div>
                <h2>Frequently asked questions</h2>
                <div class="faq-list">
                  {seo.faq.map((f) => (
                    <details class="faq" key={f.q}>
                      <summary>{f.q}</summary>
                      <p>{f.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            </section>
          )}

          <section class="related">
            <div class="section-title">More tools</div>
            <div class="related-links">
              {related.map((t) => {
                const Icon = t.icon;
                return (
                  <a key={t.id} href={`/${t.id}`}>
                    <Icon size={15} /> {t.name}
                  </a>
                );
              })}
            </div>
          </section>
        </>
      ) : loadError ? (
        <div class="alert error">Couldn’t load this tool: {loadError}. Check your connection and reload.</div>
      ) : Body ? (
        <Body key={files.map((f) => f.name + f.size).join('|')} files={files} setFiles={setFiles} reset={() => setFiles([])} />
      ) : (
        <div class="panel">
          <div class="progress indeterminate">
            <div />
          </div>
        </div>
      )}
    </div>
  );
}
