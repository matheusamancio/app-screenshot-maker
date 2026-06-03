'use client';

import React, { useEffect, useRef } from 'react';
import type { SlideElement } from '@/types';
import { fontFamilyFor } from '@/lib/fonts';

export interface ElementsLayerProps {
  elements?: SlideElement[];
  /** width / BASE_W */
  sf: number;
  /** Interactive editing handlers (omitted in export/preview → static render). */
  onSelect?: (sel: string) => void;
  onTextChange?: (id: string, text: string) => void;
  onEditStart?: (id: string) => void;
  onEditEnd?: () => void;
  editingId?: string | null;
  fontFamily?: string;
}

function CheckBadge({ size }: { size: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: -size * 0.32,
        right: -size * 0.32,
        width: size,
        height: size,
        borderRadius: '50%',
        background: '#111111',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }}
    >
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>
  );
}

/** ContentEditable text used when an element is being edited. Focuses on mount. */
function EditingBox({
  value,
  onChange,
  onDone,
  style,
}: {
  value: string;
  onChange: (v: string) => void;
  onDone: () => void;
  style: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.textContent = value;
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onInput={() => onChange(ref.current?.textContent || '')}
      onBlur={onDone}
      onKeyDown={(e) => {
        if (e.key === 'Escape') (e.target as HTMLElement).blur();
        e.stopPropagation();
      }}
      onPaste={(e) => {
        e.preventDefault();
        const t = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, t);
      }}
      style={{ ...style, outline: '2px solid var(--norte-primary)', borderRadius: 4, cursor: 'text' }}
    />
  );
}

export default function ElementsLayer({ elements, sf, onSelect, onTextChange, onEditStart, onEditEnd, editingId, fontFamily }: ElementsLayerProps) {
  if (!elements || elements.length === 0) return null;
  const interactive = !!onSelect;

  return (
    <>
      {elements.map((el) => {
        const editing = editingId === el.id;
        const common: React.CSSProperties = {
          position: 'absolute',
          left: el.x * sf,
          top: el.y * sf,
          transform: `translate(-50%, -50%) rotate(${el.rotation || 0}deg) scale(${el.scale || 1})`,
          transformOrigin: 'center center',
          pointerEvents: interactive ? 'auto' : 'none',
          cursor: interactive ? (editing ? 'text' : 'move') : 'default',
        };

        const handlers = interactive
          ? {
              'data-element': `el:${el.id}`,
              onPointerDown: (e: React.PointerEvent) => {
                if (editing) return;
                e.preventDefault();
                onSelect?.(`el:${el.id}`);
              },
              onDoubleClick: (e: React.MouseEvent) => {
                e.stopPropagation();
                onEditStart?.(el.id);
              },
            }
          : { 'data-element': `el:${el.id}` };

        if (el.kind === 'emoji') {
          const size = (el.size || 64) * sf;
          const tileStyle: React.CSSProperties = el.tile
            ? {
                width: size,
                height: size,
                borderRadius: size * 0.28,
                background: '#FFFFFF',
                boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
              }
            : { width: size, height: size };
          return (
            <div key={el.id} style={common} {...handlers}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.52, ...tileStyle }}>
                {editing ? (
                  <EditingBox
                    value={el.emoji || ''}
                    onChange={(v) => onTextChange?.(el.id, v)}
                    onDone={() => onEditEnd?.()}
                    style={{ fontSize: size * 0.52, lineHeight: 1, minWidth: size * 0.5, textAlign: 'center' }}
                  />
                ) : (
                  <span style={{ lineHeight: 1 }}>{el.emoji}</span>
                )}
                {el.tile && el.check && <CheckBadge size={size * 0.34} />}
              </div>
            </div>
          );
        }

        // text
        const textStyle: React.CSSProperties = {
          fontFamily: fontFamilyFor(el.fontFamily || fontFamily || 'Sora'),
          fontSize: (el.fontSize || 28) * sf,
          fontWeight: el.fontWeight || 700,
          color: el.color || '#111111',
          textAlign: el.align || 'center',
          lineHeight: 1.15,
          whiteSpace: 'pre-wrap',
          width: el.width ? el.width * sf : undefined,
          letterSpacing: '-0.01em',
        };
        return (
          <div key={el.id} style={common} {...handlers}>
            {editing ? (
              <EditingBox value={el.text || ''} onChange={(v) => onTextChange?.(el.id, v)} onDone={() => onEditEnd?.()} style={textStyle} />
            ) : (
              <div style={textStyle}>{el.text}</div>
            )}
          </div>
        );
      })}
    </>
  );
}
