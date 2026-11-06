import { Check, RotateCw, Trash2 } from 'lucide-preact';
import { useState } from 'preact/hooks';
import type { RenderedPage } from '../lib/pdf';

export interface PageItem {
  /** Stable key — unique across the whole grid. */
  key: string;
  page?: RenderedPage;
  label?: string;
  rotation?: number; // extra rotation applied by the user, degrees
  removed?: boolean;
}

/**
 * Thumbnail grid. Supports selection (click), drag re-ordering, per-page rotate
 * and remove depending on which callbacks are provided.
 */
export function PageGrid({
  items,
  selected,
  onToggle,
  onReorder,
  onRotate,
  onRemove,
}: {
  items: PageItem[];
  selected?: Set<string>;
  onToggle?: (key: string, shift: boolean) => void;
  onReorder?: (from: number, to: number) => void;
  onRotate?: (key: string) => void;
  onRemove?: (key: string) => void;
}) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  return (
    <div class="page-grid">
      {items.map((it, idx) => {
        const on = selected?.has(it.key);
        const cls = ['page-card', onToggle ? 'selectable' : '', on ? 'on' : '', it.removed ? 'off' : '', dragIdx === idx ? 'dragging' : ''].join(' ');
        return (
          <div
            key={it.key}
            class={cls}
            draggable={!!onReorder}
            onClick={(e) => onToggle?.(it.key, e.shiftKey)}
            onDragStart={(e) => {
              setDragIdx(idx);
              e.dataTransfer!.effectAllowed = 'move';
            }}
            onDragOver={(e) => {
              if (dragIdx == null) return;
              e.preventDefault();
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (dragIdx != null && dragIdx !== idx) onReorder?.(dragIdx, idx);
              setDragIdx(null);
            }}
            onDragEnd={() => setDragIdx(null)}
          >
            {selected && (
              <span class="check">
                <Check size={13} strokeWidth={3} />
              </span>
            )}
            <div class="img">
              {it.page ? (
                <img src={it.page.url} alt={`Page ${idx + 1}`} style={{ transform: `rotate(${it.rotation ?? 0}deg)` }} draggable={false} />
              ) : (
                <span class="muted">…</span>
              )}
            </div>
            <span class="num">{it.label ?? idx + 1}</span>
            {(onRotate || onRemove) && (
              <div class="tools">
                {onRotate && (
                  <button
                    type="button"
                    title="Rotate 90°"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRotate(it.key);
                    }}
                  >
                    <RotateCw size={14} />
                  </button>
                )}
                {onRemove && (
                  <button
                    type="button"
                    title={it.removed ? 'Restore page' : 'Remove page'}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(it.key);
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
