import { useState } from 'preact/hooks';
import { Eye, EyeOff, Lock } from 'lucide-preact';
import type { ToolProps } from './types';
import { ErrorBox, Field, Note, Progress, Result, Toggle } from '../components/ui';
import { FileList } from '../components/FileList';
import { loadPdfLib, savePdf } from '../lib/pdf';
import { baseName, type OutFile } from '../lib/files';

function ProtectTool({ files, setFiles, reset }: ToolProps) {
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [show, setShow] = useState(false);
  const [allowPrint, setAllowPrint] = useState(true);
  const [allowCopy, setAllowCopy] = useState(true);
  const [allowEdit, setAllowEdit] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [out, setOut] = useState<OutFile[]>();

  const mismatch = pw2.length > 0 && pw !== pw2;
  const ready = pw.length > 0 && pw === pw2;

  const run = async () => {
    setBusy(true);
    setError(undefined);
    try {
      const outs: OutFile[] = [];
      for (const f of files) {
        const doc = await loadPdfLib(f);
        doc.encrypt({
          userPassword: pw,
          ownerPassword: pw,
          algorithm: 'AES-256',
          permissions: {
            printing: allowPrint ? 'highResolution' : false,
            copying: allowCopy,
            contentAccessibility: true,
            modifying: allowEdit,
            annotating: allowEdit,
            fillingForms: allowEdit,
            documentAssembly: allowEdit,
          },
        });
        outs.push({ name: `${baseName(f.name)}_protected.pdf`, data: await savePdf(doc, { useObjectStreams: false }), type: 'application/pdf' });
      }
      setOut(outs);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (out) return <Result title="PDF protected" files={out} zipName="protected.zip" onReset={reset} note={<p class="muted">Keep the password safe — there is no way to recover it.</p>} />;

  return (
    <div class="workspace">
      <div class="stack">
        <FileList files={files} onChange={setFiles} />
        <Note>Encrypted with AES-256. Anyone opening the file will need the password.</Note>
      </div>
      <aside class="panel sidebar">
        <Field label="Password">
          <div style={{ position: 'relative' }}>
            <input class="input" type={show ? 'text' : 'password'} value={pw} onInput={(e) => setPw((e.currentTarget as HTMLInputElement).value)} autoComplete="new-password" style={{ paddingRight: 40 }} />
            <button type="button" class="btn btn-icon" style={{ position: 'absolute', right: 2, top: 2 }} onClick={() => setShow(!show)} title={show ? 'Hide' : 'Show'}>
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>
        <Field label="Repeat password" hint={mismatch ? 'Passwords don’t match' : undefined}>
          <input class="input" type={show ? 'text' : 'password'} value={pw2} onInput={(e) => setPw2((e.currentTarget as HTMLInputElement).value)} autoComplete="new-password" style={mismatch ? { borderColor: 'var(--danger)' } : undefined} />
        </Field>
        <Field label="Permissions">
          <div class="stack" style={{ gap: 10 }}>
            <Toggle label="Allow printing" checked={allowPrint} onChange={setAllowPrint} />
            <Toggle label="Allow copying text" checked={allowCopy} onChange={setAllowCopy} />
            <Toggle label="Allow editing" checked={allowEdit} onChange={setAllowEdit} />
          </div>
        </Field>
        {error && <ErrorBox>{error}</ErrorBox>}
        {busy && <Progress label="Encrypting…" />}
        <div class="actions">
          <button class="btn btn-accent btn-lg" onClick={run} disabled={busy || files.length === 0 || !ready}>
            <Lock size={16} /> Protect PDF
          </button>
        </div>
      </aside>
    </div>
  );
}

export default ProtectTool;
