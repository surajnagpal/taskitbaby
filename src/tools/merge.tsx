import { useState } from 'preact/hooks';
import type { ToolProps } from './types';
import { FileList } from '../components/FileList';
import { DropZone } from '../components/DropZone';
import { ErrorBox, Progress, Result } from '../components/ui';
import { PDFDocument, loadPdfLib, savePdf } from '../lib/pdf';
import type { OutFile } from '../lib/files';

function MergeTool({ files, setFiles, reset }: ToolProps) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number | undefined>();
  const [error, setError] = useState<string>();
  const [out, setOut] = useState<OutFile[]>();

  const run = async () => {
    setBusy(true);
    setError(undefined);
    setProgress(0);
    try {
      const merged = await PDFDocument.create();
      for (let i = 0; i < files.length; i++) {
        const src = await loadPdfLib(files[i]);
        const pages = await merged.copyPages(src, src.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
        setProgress((i + 1) / files.length);
      }
      const bytes = await savePdf(merged);
      setOut([{ name: 'merged.pdf', data: bytes, type: 'application/pdf' }]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (out) return <Result title="PDFs merged" files={out} onReset={reset} />;

  return (
    <div class="workspace">
      <div class="stack">
        <FileList files={files} onChange={setFiles} />
        <DropZone accept="application/pdf,.pdf" multiple hint="Drop more PDFs or click to add" compact onFiles={(f) => setFiles([...files, ...f])} />
      </div>
      <aside class="panel sidebar">
        <div class="stat">
          <span>Files</span>
          <b>{files.length}</b>
        </div>
        <p class="muted">Drag files to change their order. Pages are merged in the order shown.</p>
        {error && <ErrorBox>{error}</ErrorBox>}
        {busy && <Progress value={progress} label="Merging…" />}
        <div class="actions">
          <button class="btn btn-accent btn-lg" onClick={run} disabled={busy || files.length < 2}>
            Merge {files.length > 1 ? `${files.length} PDFs` : 'PDFs'}
          </button>
          {files.length < 2 && <span class="muted">Add at least two PDFs.</span>}
        </div>
      </aside>
    </div>
  );
}

export default MergeTool;
