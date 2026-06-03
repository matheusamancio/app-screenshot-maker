'use client';

import React, { useEffect, useRef } from 'react';
import type { SlideElement, Language } from '@/types';
import { BASE_LANGUAGE } from '@/types';
import { fontFamilyFor } from '@/lib/fonts';
import { readableTextColor } from './EditablePillText';
import Laurel from './Laurel';

export function resolveElementText(el: SlideElement, language?: Language): string {
  if (language && language !== BASE_LANGUAGE && el.loc && el.loc[language]) return el.loc[language] as string;
  return el.text || '';
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Render `[keyword]` segments as filled pills (like the pill template). */
function pillifyHtml(text: string, color: string): string {
  const pillColor = readableTextColor(color);
  const pill = (w: string) =>
    `<span style="display:inline-block;background:${color};color:${pillColor};padding:0.04em 0.32em;border-radius:0.26em;line-height:1.04;">${w}</span>`;
  return text
    .split('\n')
    .map((line) => (line ? escapeHtml(line).replace(/\[([^\]]+)\]/g, (_, w) => pill(w)) : '<br>'))
    .join('<br>');
}

export interface ElementsLayerProps {
  elements?: SlideElement[];
  /** width / BASE_W */
  sf: number;
  language?: Language;
  /** Interactive editing handlers (omitted in export/preview → static render). */
  onSelect?: (sel: string) => void;
  onTextChange?: (id: string, text: string) => void;
  onEditStart?: (id: string) => void;
  onEditEnd?: () => void;
  editingId?: string | null;
  fontFamily?: string;
}

/** Deterministic scatter fill for the heatmap (stable across renders). */
function cellFilled(i: number, fill: number): boolean {
  const h = ((i * 1103515245 + 12345) >>> 8) % 1000;
  return h / 1000 < fill;
}

function NorteIcon({ name, size, color }: { name: string; size: number; color: string }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (name) {
    case 'check': return (<svg {...p}><polyline points="20 6 9 17 4 12" /></svg>);
    case 'fire': return (<svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M12 2C9 6 7 8 7 12a5 5 0 0 0 10 0c0-1.5-.5-3-1.5-4 0 1.5-1 2-2 2 .5-2-.5-5-1.5-6z" /></svg>);
    case 'lock': return (<svg {...p}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>);
    case 'bell': return (<svg {...p}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>);
    case 'plus': return (<svg {...p}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>);
    case 'mountain': return (<svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M3 20 9 8l3 5 2-3 4 10z" /><circle cx="14" cy="3.5" r="1.4" /></svg>);
    case 'play': return (<svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M8 5v14l11-7z" /></svg>);
    default: return (<svg {...p}><circle cx="12" cy="12" r="9" /></svg>);
  }
}

function StarsRow({ n, size, color }: { n: number; size: number; color: string }) {
  return (
    <div style={{ display: 'flex', gap: size * 0.18 }}>
      {Array.from({ length: n }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M12 2l2.9 6.6 7.1.7-5.4 4.9 1.6 7-6.2-3.7L5.8 21l1.6-7L2 9.3l7.1-.7L12 2z" /></svg>
      ))}
    </div>
  );
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

export default function ElementsLayer({ elements, sf, language, onSelect, onTextChange, onEditStart, onEditEnd, editingId, fontFamily }: ElementsLayerProps) {
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

        if (el.kind !== 'text') {
          const w = (el.w || 120) * sf;
          const h = (el.h || 120) * sf;
          const fam = fontFamilyFor(el.fontFamily || fontFamily || 'Sora');
          let content: React.ReactNode = null;

          if (el.kind === 'shape') {
            content = <div style={{ width: w, height: h, background: el.bg || '#1C1C1E', borderRadius: (el.radius ?? 20) * sf }} />;
          } else if (el.kind === 'icon') {
            content = <NorteIcon name={el.icon || 'check'} size={Math.min(w, h)} color={el.color || '#111111'} />;
          } else if (el.kind === 'stars') {
            content = <StarsRow n={el.cols || 5} size={(el.size || 16) * sf} color={el.color || '#111111'} />;
          } else if (el.kind === 'laurel') {
            content = (
              <Laurel size={(el.size || 56) * sf} color={el.color || '#111111'} gap={6 * sf}>
                {el.cardValue && <div style={{ fontFamily: fam, fontSize: (el.fontSize || 30) * sf, fontWeight: 800, color: el.color || '#111111' }}>{el.cardValue}</div>}
                {el.cardCaption && <div style={{ fontFamily: fam, fontSize: 9 * sf, fontWeight: 700, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: 1 }}>{el.cardCaption}</div>}
              </Laurel>
            );
          } else if (el.kind === 'heatmap') {
            const cols = el.cols || 12;
            const rows = el.rows || 7;
            const gap = 3 * sf;
            const cellSize = (w - gap * (cols - 1)) / cols;
            const active = el.cell || '#1C1C1E';
            const idle = el.bg || '#D8D5CE';
            content = (
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`, gap, width: w }}>
                {Array.from({ length: cols * rows }).map((_, i) => (
                  <div key={i} style={{ width: cellSize, height: cellSize, borderRadius: cellSize * 0.22, background: cellFilled(i, el.fill ?? 0.5) ? active : idle }} />
                ))}
              </div>
            );
          } else if (el.kind === 'datestrip') {
            const days = (el.days || 'Q,S,S,D,S,T').split(',');
            const dates = (el.dates || '28,29,30,31,1,2').split(',');
            const n = Math.max(days.length, dates.length);
            const ai = el.activeIndex ?? n - 1;
            const cw = (el.w || 320) / n;
            content = (
              <div style={{ display: 'flex', gap: 6 * sf, fontFamily: fam }}>
                {Array.from({ length: n }).map((_, i) => {
                  const on = i === ai;
                  return (
                    <div key={i} style={{ width: cw * sf, height: cw * 1.35 * sf, borderRadius: 12 * sf, background: on ? '#111111' : '#FFFFFF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                      <span style={{ fontSize: 9 * sf, color: on ? 'rgba(255,255,255,0.6)' : '#9b9890', fontWeight: 600 }}>{days[i] || ''}</span>
                      <span style={{ fontSize: 16 * sf, color: on ? '#fff' : '#111111', fontWeight: 800 }}>{dates[i] || ''}</span>
                    </div>
                  );
                })}
              </div>
            );
          } else if (el.kind === 'card') {
            const dark = (el.bg || '#1C1C1E').toLowerCase();
            const isDark = readableTextColor(dark) === '#FFFFFF';
            const fg = isDark ? '#FFFFFF' : '#111111';
            content = (
              <div style={{ width: w, minHeight: h, background: el.bg || '#1C1C1E', borderRadius: (el.radius ?? 22) * sf, padding: `${14 * sf}px ${16 * sf}px`, fontFamily: fam, display: 'flex', flexDirection: 'column', gap: 4 * sf }}>
                {el.cardTitle && <div style={{ fontSize: 11 * sf, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: isDark ? 'rgba(255,255,255,0.6)' : '#9b9890' }}>{el.cardTitle}</div>}
                {el.cardValue && <div style={{ fontSize: (el.fontSize || 40) * sf, fontWeight: 800, color: el.accent || fg, lineHeight: 1, letterSpacing: '-0.02em' }}>{el.cardValue}</div>}
                {el.cardCaption && <div style={{ fontSize: 14 * sf, fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.85)' : '#4a4845' }}>{el.cardCaption}</div>}
              </div>
            );
          }

          return (
            <div key={el.id} style={common} {...handlers}>
              {content}
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
        const shown = resolveElementText(el, language);
        return (
          <div key={el.id} style={common} {...handlers}>
            {editing ? (
              <EditingBox value={shown} onChange={(v) => onTextChange?.(el.id, v)} onDone={() => onEditEnd?.()} style={textStyle} />
            ) : (
              <div style={textStyle} dangerouslySetInnerHTML={{ __html: pillifyHtml(shown, el.color || '#111111') }} />
            )}
          </div>
        );
      })}
    </>
  );
}
