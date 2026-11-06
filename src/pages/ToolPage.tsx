import { useEffect, useState } from 'preact/hooks';
import { ArrowLeft, ShieldCheck } from 'lucide-preact';
import { useRoute } from 'preact-iso';
import { TOOLS } from '../tools';
import { DropZone } from '../components/DropZone';

export function ToolPage() {
  const { params } = useRoute();
  const tool = TOOLS.find((t) => t.id === params.toolId);
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    document.title = tool ? `${tool.name} — Taskitbaby` : 'Taskitbaby';
    return () => {
      document.title = 'Taskitbaby — Free PDF tools, private by design';
    };
  }, [tool]);

  // reset when switching tools
  useEffect(() => setFiles([]), [params.toolId]);

  if (!tool) {
    return (
      <div class="container">
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

  const Body = tool.component;

  return (
    <div class="container fade-in">
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
        </>
      ) : (
        <Body key={files.map((f) => f.name + f.size).join('|')} files={files} setFiles={setFiles} reset={() => setFiles([])} />
      )}
    </div>
  );
}
