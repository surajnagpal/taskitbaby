import { useState } from 'preact/hooks';
import { Eye, EyeOff, LockOpen } from 'lucide-preact';
import type { Tool, ToolProps } from './types';
import { ErrorBox, Field, Note, Progress, Result } from '../components/ui';
import { FileList } from '../components/FileList';
import { PDFDocument, PdfPasswordError, loadPdfLib, savePdf } from '../lib/pdf';
import { baseName, type OutFile } from '../lib/files';

function UnlockTool({ files, setFiles, reset }: ToolProps) {
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [out, setOut] = useState<OutFile[]>();

  const run = async () => {
    setBusy(true);
    setError(undefined);
    try {
      const outs: OutFile[] = [];
      for (const f of files) {
        let src: PDFDocument;
        try {
          src = await loadPdfLib(f, pw || undefined);
        } catch (e) {
          if (e instanceof PdfPasswordError || /password/i.test(String((e as Error).message))) throw new Error(pw ? `Wrong password for ${f.name}.` : `${f.name} needs a password.`);
          throw e;
        }
        // Copy pages into a fresh, unencrypted document.
        const doc = await PDFDocument.create();
        const pages = await doc.copyPages(src, src.getPageIndices());
        pages.forEach((p) => doc.addPage(p));
        outs.push({ name: `${baseName(f.name)}_unlocked.pdf`, data: await savePdf(doc), type: 'application/pdf' });
      }
      setOut(outs);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (out) return <Result title="PDF unlocked" files={out} zipName="unlocked.zip" onReset={reset} />;

  return (
    <div class="workspace">
      <div class="stack">
        <FileList files={files} onChange={setFiles} showThumbs={false} />
        <Note>Only unlock PDFs you have the right to open. The password is used on your device and never sent anywhere.</Note>
      </div>
      <aside class="panel sidebar">
        <Field label="Password" hint="Leave empty if the file only restricts printing or copying.">
          <div style={{ position: 'relative' }}>
            <input class="input" type={show ? 'text' : 'password'} value={pw} onInput={(e) => setPw((e.currentTarget as HTMLInputElement).value)} autoComplete="off" style={{ paddingRight: 40 }} />
            <button type="button" class="btn btn-icon" style={{ position: 'absolute', right: 2, top: 2 }} onClick={() => setShow(!show)} title={show ? 'Hide' : 'Show'}>
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>
        {error && <ErrorBox>{error}</ErrorBox>}
        {busy && <Progress label="Unlocking…" />}
        <div class="actions">
          <button class="btn btn-accent btn-lg" onClick={run} disabled={busy || files.length === 0}>
            <LockOpen size={16} /> Unlock PDF
          </button>
        </div>
      </aside>
    </div>
  );
}

export const unlock: Tool = {
  id: 'unlock-pdf',
  name: 'Unlock PDF',
  description: 'Remove a password or restrictions from a PDF you have the right to open.',
  category: 'security',
  icon: LockOpen,
  accept: 'application/pdf,.pdf',
  multiple: true,
  component: UnlockTool,
};
