import { useState } from 'preact/hooks';
import type { ToolProps } from './types';
import { ErrorBox, Field, Progress, Result, Seg } from '../components/ui';
import { FileList } from '../components/FileList';
import { StandardFonts, degrees, loadPdfLib, rgb, savePdf } from '../lib/pdf';
import { baseName, type OutFile } from '../lib/files';

type Layout = 'center' | 'tile';

function WatermarkTool({ files, setFiles, reset }: ToolProps) {
  const [text, setText] = useState('CONFIDENTIAL');
  const [layout, setLayout] = useState<Layout>('center');
  const [opacity, setOpacity] = useState(0.18);
  const [size, setSize] = useState(56);
  const [angle, setAngle] = useState(-35);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [out, setOut] = useState<OutFile[]>();

  const run = async () => {
    setBusy(true);
    setError(undefined);
    try {
      const outs: OutFile[] = [];
      for (const f of files) {
        const doc = await loadPdfLib(f);
        const font = await doc.embedFont(StandardFonts.HelveticaBold);
        for (const p of doc.getPages()) {
          const { width, height } = p.getSize();
          const tw = font.widthOfTextAtSize(text, size);
          const th = size;
          const rad = (angle * Math.PI) / 180;
          const draw = (cx: number, cy: number) => {
            // rotate about the text's centre
            const dx = (tw / 2) * Math.cos(rad) - (th / 2) * Math.sin(rad);
            const dy = (tw / 2) * Math.sin(rad) + (th / 2) * Math.cos(rad);
            p.drawText(text, { x: cx - dx, y: cy - dy + th * 0.15, size, font, color: rgb(0.45, 0.45, 0.45), opacity, rotate: degrees(angle) });
          };
          if (layout === 'center') draw(width / 2, height / 2);
          else {
            const stepX = tw + size * 1.5;
            const stepY = size * 3.5;
            for (let y = -stepY; y < height + stepY; y += stepY)
              for (let x = -stepX; x < width + stepX; x += stepX) draw(x + ((y / stepY) % 2 ? stepX / 2 : 0), y);
          }
        }
        outs.push({ name: `${baseName(f.name)}_watermarked.pdf`, data: await savePdf(doc), type: 'application/pdf' });
      }
      setOut(outs);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (out) return <Result title="Watermark added" files={out} zipName="watermarked.zip" onReset={reset} />;

  return (
    <div class="workspace">
      <div class="stack">
        <FileList files={files} onChange={setFiles} />
        <div class="panel" style={{ display: 'grid', placeItems: 'center', padding: 24 }}>
          <div style={{ width: 220, aspectRatio: '1 / 1.41', background: '#fff', borderRadius: 4, position: 'relative', overflow: 'hidden', display: 'grid', placeItems: 'center' }}>
            <span style={{ color: `rgba(115,115,115,${opacity + 0.2})`, fontWeight: 700, fontSize: size * 0.3, transform: `rotate(${angle}deg)`, whiteSpace: 'nowrap', fontFamily: 'Helvetica, Arial, sans-serif' }}>
              {text || ' '}
            </span>
          </div>
        </div>
      </div>
      <aside class="panel sidebar">
        <Field label="Text">
          <input class="input" value={text} onInput={(e) => setText((e.currentTarget as HTMLInputElement).value)} maxLength={60} />
        </Field>
        <Field label="Layout">
          <Seg
            full
            value={layout}
            onChange={setLayout}
            options={[
              { value: 'center', label: 'Centered' },
              { value: 'tile', label: 'Tiled' },
            ]}
          />
        </Field>
        <Field label={`Opacity · ${Math.round(opacity * 100)}%`}>
          <input class="range" type="range" min={0.05} max={0.8} step={0.01} value={opacity} onInput={(e) => setOpacity(parseFloat((e.currentTarget as HTMLInputElement).value))} />
        </Field>
        <Field label={`Size · ${size}`}>
          <input class="range" type="range" min={12} max={140} step={2} value={size} onInput={(e) => setSize(parseInt((e.currentTarget as HTMLInputElement).value))} />
        </Field>
        <Field label={`Angle · ${angle}°`}>
          <input class="range" type="range" min={-90} max={90} step={5} value={angle} onInput={(e) => setAngle(parseInt((e.currentTarget as HTMLInputElement).value))} />
        </Field>
        {error && <ErrorBox>{error}</ErrorBox>}
        {busy && <Progress label="Stamping…" />}
        <div class="actions">
          <button class="btn btn-accent btn-lg" onClick={run} disabled={busy || files.length === 0 || !text.trim()}>
            Add watermark
          </button>
        </div>
      </aside>
    </div>
  );
}

export default WatermarkTool;
