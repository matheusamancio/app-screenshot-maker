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
  /** Toggle a habit-row's check (flag/unflag) when its circle is clicked. */
  onToggleCheck?: (id: string) => void;
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

function CheckBadge({ size, color = '#111111' }: { size: number; color?: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: -size * 0.42,
        right: -size * 0.42,
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 10px rgba(0,0,0,0.28)',
      }}
    >
      <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
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

const MONO = "'SFMono-Regular', ui-monospace, 'JetBrains Mono', 'Roboto Mono', Menlo, monospace";

function hexToRgba(hex: string, a: number): string {
  const m = hex.replace('#', '');
  const f = m.length === 3 ? m.split('').map((c) => c + c).join('') : m;
  const r = parseInt(f.slice(0, 2), 16), g = parseInt(f.slice(2, 4), 16), b = parseInt(f.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/** Darken a hex colour toward black by `amt` (0..1) — used for readable pill text. */
function darken(hex: string, amt: number): string {
  const m = hex.replace('#', '');
  const f = m.length === 3 ? m.split('').map((c) => c + c).join('') : m;
  const d = (i: number) => Math.round(parseInt(f.slice(i, i + 2), 16) * (1 - amt));
  return `rgb(${d(0)}, ${d(2)}, ${d(4)})`;
}

/** Framed habit-grid card: header (emoji + label + %), scatter grid with a dashed "today" cell, footer. */
function HeatmapCard({ el, sf }: { el: SlideElement; sf: number }) {
  const u = sf * ((el.w || 320) / 320); // width-proportional unit
  const w = (el.w || 320) * sf;
  const pad = 16 * u;
  const cols = el.cols || 10;
  const rows = el.rows || 7;
  const gap = 5 * u;
  const innerW = w - pad * 2;
  const cellSize = (innerW - gap * (cols - 1)) / cols;
  const active = el.cell || '#1A1A1A';
  const idle = el.bg || '#D8D5CE';
  const todayIdx = (rows - 1) * cols + (cols - 2);
  const pct = el.cardValue || '';
  return (
    <div style={{ width: w, background: el.color || '#F4F2ED', borderRadius: (el.radius ?? 24) * u, padding: pad, fontFamily: fontFamilyFor('Sora'), display: 'flex', flexDirection: 'column', gap: 12 * u }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 17 * u, fontWeight: 800, color: '#1A1A1A', letterSpacing: '-0.01em' }}>{el.cardTitle}</span>
        {pct && (
          <span style={{ fontWeight: 800, color: '#1A1A1A', lineHeight: 1 }}>
            <span style={{ fontSize: 22 * u }}>{pct}</span>
            <span style={{ fontSize: 12 * u, color: '#a8a49c' }}>%</span>
          </span>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`, gap }}>
        {Array.from({ length: cols * rows }).map((_, i) => {
          if (i === todayIdx) {
            return <div key={i} style={{ width: cellSize, height: cellSize, borderRadius: cellSize * 0.26, border: `${1.5 * u}px dashed #b8b4ac`, boxSizing: 'border-box' }} />;
          }
          return <div key={i} style={{ width: cellSize, height: cellSize, borderRadius: cellSize * 0.26, background: cellFilled(i, el.fill ?? 0.5) ? active : idle }} />;
        })}
      </div>
      {el.cardCaption && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: MONO, fontSize: 10 * u, color: '#8a877f' }}>
          <span>{el.cardCaption}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 * u }}>
            <span style={{ width: 11 * u, height: 11 * u, borderRadius: 3 * u, border: `${1.5 * u}px dashed #b8b4ac`, display: 'inline-block' }} />
            hoje
          </span>
        </div>
      )}
    </div>
  );
}

/** Month-by-month bar chart with a two-segment toggle pill. */
function BarChartCard({ el, sf }: { el: SlideElement; sf: number }) {
  const u = sf * ((el.w || 300) / 300); // width-proportional unit
  const w = (el.w || 300) * sf;
  const totalH = (el.h || 340) * sf;
  const toggleH = 38 * u;
  const gap = 12 * u;
  const cardH = totalH - toggleH - gap;
  const labels = (el.days || '').split(',');
  const values = (el.dates || '').split(',').map((s) => parseFloat(s) || 0);
  const n = Math.max(labels.length, values.length);
  const ai = el.activeIndex ?? n - 1;
  const maxV = Math.max(1, ...values);
  const pad = 16 * u;
  const labelBlock = 34 * u;
  const barsAreaH = cardH - pad * 2 - labelBlock;
  const slot = (w - pad * 2) / n;
  const barW = slot * 0.62;
  return (
    <div style={{ width: w, fontFamily: fontFamilyFor('Sora') }}>
      {/* toggle */}
      <div style={{ display: 'flex', height: toggleH, background: '#E4E1DA', borderRadius: toggleH / 2, padding: 3 * u, marginBottom: gap }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 * u, fontWeight: 600, color: '#9b9890' }}>{el.toggleLeft}</div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 * u, fontWeight: 800, color: '#1A1A1A', background: '#FFFFFF', borderRadius: toggleH / 2, boxShadow: '0 1px 4px rgba(0,0,0,0.10)' }}>{el.toggleRight}</div>
      </div>
      {/* card */}
      <div style={{ width: w, height: cardH, background: el.bg || '#F4F2ED', borderRadius: (el.radius ?? 22) * u, padding: pad, boxSizing: 'border-box', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        {Array.from({ length: n }).map((_, i) => {
          const on = i === ai;
          const barH = barsAreaH * (0.16 + 0.84 * (values[i] / maxV));
          return (
            <div key={i} style={{ width: slot, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: barsAreaH + labelBlock }}>
              <div style={{ width: barW, height: barH, background: on ? (el.accent || '#1A1A1A') : (el.cell || '#C9C5BD'), borderRadius: barW * 0.34 }} />
              <span style={{ marginTop: 8 * u, fontFamily: MONO, fontSize: 11 * u, letterSpacing: '0.04em', color: on ? '#1A1A1A' : '#a8a49c', fontWeight: on ? 700 : 400 }}>{labels[i]}</span>
              <span style={{ marginTop: 3 * u, fontFamily: MONO, fontSize: 12 * u, color: '#1A1A1A', fontWeight: on ? 800 : 600 }}>{values[i]}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Smooth cubic path through points with horizontal control tangents. */
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 1], p1 = pts[i];
    const dx = (p1.x - p0.x) * 0.4;
    d += ` C ${p0.x + dx} ${p0.y}, ${p1.x - dx} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  return d;
}

/** Cumulative line chart with filled areas + habit toggle pills + axes. */
function LineChartCard({ el, sf }: { el: SlideElement; sf: number }) {
  const u = sf * ((el.w || 320) / 320); // width-proportional unit
  const w = (el.w || 320) * sf;
  const totalH = (el.h || 320) * sf;
  const series = el.series || [];
  const labels = (el.days || '').split(',');
  const n = labels.length;
  const ticks = (el.yTicks || '0').split(',').map((s) => parseFloat(s) || 0);
  const yMax = el.yMax || Math.max(1, ...series.flatMap((s) => s.values.map((v) => v ?? 0)));

  // pills row
  const pillsH = 36 * u;
  const footerH = el.cardCaption ? 24 * u : 0;
  // card geometry
  const padL = 34 * u, padR = 36 * u, padT = 22 * u, padB = 40 * u;
  const cardH = totalH - pillsH - 12 * u - footerH;
  const plotW = w - padL - padR;
  const plotH = cardH - padT - padB;
  const xFor = (i: number) => padL + (n <= 1 ? 0 : (i / (n - 1)) * plotW);
  const yFor = (v: number) => padT + plotH * (1 - v / yMax);
  const baseY = yFor(0);

  // End points + de-overlapped value-label positions (so close values like 23/20 don't collide).
  type End = { x: number; y: number; color: string; val: number | null; labelY: number };
  const endPoints: End[] = series
    .map((s) => {
      const pts = s.values.map((v, i) => (v == null ? null : { x: xFor(i), y: yFor(v) })).filter(Boolean) as { x: number; y: number }[];
      if (!pts.length) return null;
      const last = pts[pts.length - 1];
      return { x: last.x, y: last.y, color: s.color, val: s.values[s.values.length - 1] ?? null, labelY: last.y - 11 * u };
    })
    .filter(Boolean) as End[];
  // assign label Y top→bottom with a minimum gap
  [...endPoints].sort((a, b) => a.labelY - b.labelY).reduce((prev, e) => {
    if (e.labelY < prev + 18 * u) e.labelY = prev + 18 * u;
    return e.labelY;
  }, -Infinity);

  return (
    <div style={{ width: w, fontFamily: fontFamilyFor('Sora') }}>
      {/* habit toggle pills */}
      <div style={{ display: 'flex', gap: 8 * u, height: pillsH, marginBottom: 12 * u, flexWrap: 'nowrap', overflow: 'hidden' }}>
        {series.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', padding: `0 ${12 * u}px`, borderRadius: pillsH / 2, background: hexToRgba(s.color, 0.26), color: darken(s.color, 0.34), fontSize: 12 * u, fontWeight: 600, whiteSpace: 'nowrap' }}>{s.label}</div>
        ))}
      </div>
      {/* card */}
      <div style={{ width: w, height: cardH, background: el.bg || '#F4F2ED', borderRadius: (el.radius ?? 22) * u, position: 'relative', overflow: 'hidden', border: `${1 * u}px solid rgba(0,0,0,0.06)`, boxShadow: '0 6px 18px rgba(0,0,0,0.05)' }}>
        <svg width={w} height={cardH} style={{ display: 'block' }}>
          {/* dotted gridlines + y labels */}
          {ticks.map((t, i) => (
            <g key={i}>
              <line x1={padL} y1={yFor(t)} x2={w - padR} y2={yFor(t)} stroke="#c4c0b8" strokeWidth={1.5 * u} strokeLinecap="round" strokeDasharray={`${0.5 * u} ${7 * u}`} />
              <text x={padL - 12 * u} y={yFor(t) + 4 * u} textAnchor="end" fontFamily={MONO} fontSize={12 * u} fill="#a8a49c">{t}</text>
            </g>
          ))}
          {/* series areas + lines */}
          {series.map((s, si) => {
            const pts = s.values.map((v, i) => (v == null ? null : { x: xFor(i), y: yFor(v) })).filter(Boolean) as { x: number; y: number }[];
            if (pts.length === 0) return null;
            const line = smoothPath(pts);
            const area = `${line} L ${pts[pts.length - 1].x} ${baseY} L ${pts[0].x} ${baseY} Z`;
            return (
              <g key={si}>
                <path d={area} fill={hexToRgba(s.color, 0.13)} />
                <path d={line} fill="none" stroke={s.color} strokeWidth={3.5 * u} strokeLinecap="round" strokeLinejoin="round" />
              </g>
            );
          })}
          {/* end dots + value labels (drawn after lines so they sit on top) */}
          {endPoints.map((e, si) => (
            <g key={si}>
              <circle cx={e.x} cy={e.y} r={5.5 * u} fill={e.color} stroke={el.bg || '#F4F2ED'} strokeWidth={2 * u} />
              {e.val != null && (
                <text x={e.x - 2 * u} y={e.labelY} textAnchor="end" fontFamily={fontFamilyFor('Sora')} fontSize={15 * u} fontWeight={800} fill="#1A1A1A" letterSpacing="-0.02em">{e.val}</text>
              )}
            </g>
          ))}
          {/* x labels */}
          {labels.map((lb, i) => {
            const on = i === n - 1;
            return <text key={i} x={xFor(i)} y={cardH - padB + 26 * u} textAnchor="middle" fontFamily={MONO} fontSize={12.5 * u} fontWeight={on ? 700 : 400} fill={on ? '#1A1A1A' : '#a8a49c'}>{lb}</text>;
          })}
        </svg>
      </div>
      {/* footer (below the card) */}
      {el.cardCaption && (
        <div style={{ fontFamily: MONO, fontSize: 12 * u, color: '#8a877f', marginTop: 10 * u }}>{el.cardCaption}</div>
      )}
    </div>
  );
}

/** Two-stat streak card: current streak + record, divider, "Cumprido hoje" footer. */
function StreakCard({ el, sf }: { el: SlideElement; sf: number }) {
  const u = sf * ((el.w || 320) / 320); // width-proportional unit
  const w = (el.w || 320) * sf;
  const pad = 26 * u;
  const unit = el.unit ?? 'd';
  const muted = '#8d8a84';
  const labelStyle: React.CSSProperties = { fontFamily: MONO, fontSize: 11 * u, letterSpacing: '0.12em', textTransform: 'uppercase', color: muted, display: 'flex', alignItems: 'center', gap: 5 * u };
  const Stat = ({ label, value, fire, color }: { label: string; value: string; fire?: boolean; color: string }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 * u }}>
      <div style={labelStyle}>
        {fire && <span style={{ fontSize: 13 * u }}>🔥</span>}
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 * u }}>
        <span style={{ fontFamily: fontFamilyFor('Sora'), fontSize: 64 * u, fontWeight: 800, lineHeight: 0.8, color, letterSpacing: '-0.03em' }}>{value}</span>
        <span style={{ fontFamily: fontFamilyFor('Sora'), fontSize: 22 * u, fontWeight: 800, color: muted, paddingBottom: 4 * u }}>{unit}</span>
        {fire && el.showFire !== false && <span style={{ fontSize: 30 * u, paddingBottom: 2 * u }}>🔥</span>}
      </div>
    </div>
  );
  return (
    <div style={{ width: w, background: el.bg || '#1A1A1A', borderRadius: (el.radius ?? 28) * u, padding: pad, fontFamily: fontFamilyFor('Sora'), display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: 36 * u }}>
        <Stat label={el.cardTitle || ''} value={el.cardValue || ''} fire color="#F4F2ED" />
        {(el.cardTitle2 || el.cardValue2) && <Stat label={el.cardTitle2 || ''} value={el.cardValue2 || ''} color={muted} />}
      </div>
      {el.cardCaption && (
        <>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.12)', margin: `${20 * u}px 0` }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 * u }}>
            <svg width={20 * u} height={20 * u} viewBox="0 0 24 24" fill="none" stroke="#F4F2ED" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            <span style={{ fontSize: 17 * u, fontWeight: 600, color: '#F4F2ED' }}>{el.cardCaption}</span>
          </div>
        </>
      )}
    </div>
  );
}

/** iOS-style notification banner: app icon + name + time, bold title, body. */
function NotificationCard({ el, sf, editing, onTextChange, onEditEnd }: { el: SlideElement; sf: number; editing: boolean; onTextChange?: (id: string, t: string) => void; onEditEnd?: () => void }) {
  const u = sf * ((el.w || 320) / 320);
  const w = (el.w || 320) * sf;
  const pad = 15 * u;
  return (
    <div style={{ width: w, background: el.bg || '#FBFAF8', borderRadius: (el.radius ?? 20) * u, padding: pad, fontFamily: fontFamilyFor('Sora'), boxShadow: '0 10px 30px rgba(0,0,0,0.10)', display: 'flex', flexDirection: 'column', gap: 5 * u }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 * u }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 * u }}>
          <div style={{ width: 18 * u, height: 18 * u, borderRadius: 5 * u, background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <NorteIcon name="mountain" size={12 * u} color="#F4F2ED" />
          </div>
          <span style={{ fontFamily: MONO, fontSize: 11 * u, letterSpacing: '0.12em', color: '#8a877f' }}>{el.cardTitle}</span>
        </div>
        <span style={{ fontFamily: MONO, fontSize: 11 * u, color: '#a8a49c' }}>{el.cardValue}</span>
      </div>
      {editing ? (
        <EditingBox value={resolveElementText(el)} onChange={(v) => onTextChange?.(el.id, v)} onDone={() => onEditEnd?.()} style={{ fontFamily: fontFamilyFor('Sora'), fontSize: 17 * u, fontWeight: 800, color: el.color || '#1A1A1A' }} />
      ) : (
        <div style={{ fontSize: 17 * u, fontWeight: 800, color: el.color || '#1A1A1A', letterSpacing: '-0.01em' }}>{resolveElementText(el)}</div>
      )}
      {el.cardCaption && <div style={{ fontSize: 13.5 * u, fontWeight: 400, color: '#6f6c66', lineHeight: 1.3 }}>{el.cardCaption}</div>}
    </div>
  );
}

/** Norte home/lock-screen widget — today list · done square · month heatmap. */
function WidgetCard({ el, sf, editing, onTextChange, onEditEnd }: { el: SlideElement; sf: number; editing: boolean; onTextChange?: (id: string, t: string) => void; onEditEnd?: () => void }) {
  const u = sf * ((el.w || 300) / 300);
  const w = (el.w || 300) * sf;
  const variant = el.variant || 'today';
  const pad = 16 * u;
  const fg = el.color || '#F4F2ED';
  const muted = 'rgba(244,242,232,0.5)';
  const header = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 * u }}>
      <span style={{ fontFamily: MONO, fontSize: 9.5 * u, letterSpacing: '0.14em', color: muted, display: 'flex', alignItems: 'center', gap: 4 * u }}>
        <span style={{ fontSize: 10 * u }}>▲</span>{el.cardTitle}
      </span>
      <span style={{ fontFamily: MONO, fontSize: 9.5 * u, letterSpacing: '0.08em', color: el.cardValue && el.cardValue.includes('🔥') ? el.accent || '#E8923C' : muted }}>{el.cardValue}</span>
    </div>
  );
  const titleEl = editing ? (
    <EditingBox value={resolveElementText(el)} onChange={(v) => onTextChange?.(el.id, v)} onDone={() => onEditEnd?.()} style={{ fontFamily: fontFamilyFor('Sora'), fontSize: 24 * u, fontWeight: 800, color: fg }} />
  ) : (
    <span style={{ fontSize: 24 * u, fontWeight: 800, color: fg, letterSpacing: '-0.02em' }}>{resolveElementText(el)}</span>
  );

  if (variant === 'today') {
    return (
      <div style={{ width: w, background: el.bg || '#1A1A1A', borderRadius: (el.radius ?? 18) * u, padding: pad, fontFamily: fontFamilyFor('Sora'), boxSizing: 'border-box' }}>
        {header}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 * u }}>
          {(el.items || []).map((it, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 * u }}>
              <span style={{ flexShrink: 0, width: 20 * u, height: 20 * u, borderRadius: '50%', background: it.done ? fg : 'transparent', border: it.done ? 'none' : `${1.5 * u}px solid rgba(244,242,232,0.4)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {it.done && <svg width={11 * u} height={11 * u} viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
              </span>
              <span style={{ fontSize: 13 * u }}>{it.emoji}</span>
              <span style={{ flex: 1, minWidth: 0, fontSize: 14 * u, fontWeight: 600, color: it.done ? fg : muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.name}</span>
              <span style={{ fontFamily: MONO, fontSize: 11 * u, color: it.done ? el.accent || '#E8923C' : muted }}>{it.meta}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'done') {
    return (
      <div style={{ width: w, height: (el.h || 150) * sf, background: el.bg || '#1A1A1A', borderRadius: (el.radius ?? 20) * u, padding: pad, fontFamily: fontFamilyFor('Sora'), boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
        {header}
        {titleEl}
        <span style={{ fontFamily: MONO, fontSize: 9 * u, letterSpacing: '0.12em', color: muted, marginTop: 3 * u }}>{el.cardCaption}</span>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <span style={{ width: 40 * u, height: 40 * u, borderRadius: '50%', background: el.check ? fg : 'transparent', border: el.check ? 'none' : `${2 * u}px solid rgba(244,242,232,0.4)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {el.check && <svg width={20 * u} height={20 * u} viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
          </span>
          {el.cardValue2 && <span style={{ fontFamily: MONO, fontSize: 13 * u, color: muted }}>{el.cardValue2}</span>}
        </div>
      </div>
    );
  }

  // month
  const cols = el.cols || 7;
  const rows = el.rows || 5;
  const gap = 3 * u;
  const innerW = w - pad * 2;
  const cellSize = (innerW - gap * (cols - 1)) / cols;
  return (
    <div style={{ width: w, height: (el.h || 150) * sf, background: el.bg || '#1A1A1A', borderRadius: (el.radius ?? 20) * u, padding: pad, fontFamily: fontFamilyFor('Sora'), boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      {header}
      {titleEl}
      <span style={{ fontFamily: MONO, fontSize: 9 * u, letterSpacing: '0.1em', color: muted, marginTop: 3 * u, marginBottom: 8 * u }}>{el.cardCaption}</span>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`, gap }}>
        {Array.from({ length: cols * rows }).map((_, i) => (
          <div key={i} style={{ width: cellSize, height: cellSize, borderRadius: cellSize * 0.26, background: cellFilled(i, el.fill ?? 0.5) ? (el.cell || '#F4F2ED') : 'rgba(244,242,232,0.14)' }} />
        ))}
      </div>
    </div>
  );
}

export default function ElementsLayer({ elements, sf, language, onSelect, onTextChange, onEditStart, onEditEnd, editingId, fontFamily, onToggleCheck }: ElementsLayerProps) {
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
          const emojiFs = size * (el.tile ? 0.58 : 0.52);
          const tileStyle: React.CSSProperties = el.tile
            ? {
                width: size,
                height: size,
                borderRadius: size * 0.28,
                background: 'linear-gradient(150deg, #FFFFFF 0%, #F4F2ED 100%)',
                boxShadow: '0 10px 24px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.9)',
              }
            : { width: size, height: size };
          return (
            <div key={el.id} style={common} {...handlers}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: emojiFs, ...tileStyle }}>
                {editing ? (
                  <EditingBox
                    value={el.emoji || ''}
                    onChange={(v) => onTextChange?.(el.id, v)}
                    onDone={() => onEditEnd?.()}
                    style={{ fontSize: emojiFs, lineHeight: 1, minWidth: size * 0.5, textAlign: 'center' }}
                  />
                ) : (
                  <span style={{ lineHeight: 1 }}>{el.emoji}</span>
                )}
                {el.tile && el.check && <CheckBadge size={size * 0.4} />}
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
            const fill = el.bg2 ? `linear-gradient(180deg, ${el.bg || '#1C1C1E'}, ${el.bg2})` : el.bg || '#1C1C1E';
            content = <div style={{ width: w, height: h, background: fill, borderRadius: (el.radius ?? 20) * sf }} />;
          } else if (el.kind === 'icon') {
            if (el.tile) {
              const ts = (el.size || 64) * sf;
              content = (
                <div style={{ position: 'relative', width: ts, height: ts, borderRadius: (el.radius ?? 12) * sf, background: el.bg || '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 22px rgba(0,0,0,0.16)' }}>
                  <NorteIcon name={el.icon || 'check'} size={ts * 0.56} color={el.color || '#FFFFFF'} />
                  {el.check && <CheckBadge size={ts * 0.36} color={el.accent || '#E8923C'} />}
                </div>
              );
            } else {
              content = <NorteIcon name={el.icon || 'check'} size={Math.min(w, h)} color={el.color || '#111111'} />;
            }
          } else if (el.kind === 'button') {
            content = (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 * sf, height: (el.h || 56) * sf, padding: `0 ${30 * sf}px`, background: el.bg || '#1A1A1A', color: el.color || '#F4F2ED', borderRadius: (el.radius ?? 28) * sf, fontFamily: fam, fontSize: (el.fontSize || 17) * sf, fontWeight: 700, boxShadow: '0 8px 20px rgba(0,0,0,0.16)', whiteSpace: 'nowrap' }}>
                {editing ? (
                  <EditingBox value={el.text || ''} onChange={(v) => onTextChange?.(el.id, v)} onDone={() => onEditEnd?.()} style={{ fontFamily: fam, fontSize: (el.fontSize || 17) * sf, fontWeight: 700, color: el.color || '#F4F2ED' }} />
                ) : (
                  <span>{resolveElementText(el, language)}</span>
                )}
                {el.showArrow && <span style={{ fontSize: (el.fontSize || 17) * sf, opacity: 0.95 }}>→</span>}
              </div>
            );
          } else if (el.kind === 'blur') {
            content = (
              <div style={{ width: w, height: h, borderRadius: (el.radius ?? 16) * sf, backdropFilter: `blur(${(el.blur || 7) * sf}px)`, WebkitBackdropFilter: `blur(${(el.blur || 7) * sf}px)`, background: 'rgba(244,242,232,0.22)' }} />
            );
          } else if (el.kind === 'phone') {
            const top = el.bg || '#000000';
            const bottom = el.bg2 || '#A6A6A6';
            content = (
              <div
                style={{
                  width: w,
                  height: h,
                  borderRadius: (el.radius ?? 46) * sf,
                  background: `linear-gradient(180deg, ${top} 0%, ${top} 40%, ${bottom} 100%)`,
                  boxShadow: `0 ${24 * sf}px ${60 * sf}px rgba(0,0,0,0.20), inset 0 0 0 ${1.5 * sf}px rgba(255,255,255,0.05)`,
                  position: 'relative',
                }}
              >
                {el.island !== false && (
                  <div
                    style={{
                      position: 'absolute',
                      top: h * 0.045,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: w * 0.33,
                      height: Math.max(14 * sf, h * 0.042),
                      background: '#000000',
                      borderRadius: 999,
                      // faint sheen so the pill reads against the black top
                      boxShadow: `0 0 0 ${1 * sf}px rgba(255,255,255,0.07), inset 0 ${1 * sf}px ${2 * sf}px rgba(255,255,255,0.06)`,
                    }}
                  />
                )}
              </div>
            );
          } else if (el.kind === 'habitrow') {
            const u = sf * ((el.w || 356) / 356);
            const pad = 16 * u;
            const circle = 40 * u;
            const cols = el.cols || 8;
            const rows = el.rows || 6;
            const gap = 2.5 * u;
            const cellSize = 9 * u;
            const heatW = cols * cellSize + (cols - 1) * gap;
            const active = el.cell || '#1A1A1A';
            const idle = '#DCDAD3';
            const todayIdx = (rows - 1) * cols + (cols - 1);
            const name = resolveElementText(el, language);
            content = (
              <div style={{ width: w, minHeight: h, background: el.bg || '#F4F2ED', borderRadius: (el.radius ?? 20) * sf, padding: `0 ${pad}px`, display: 'flex', alignItems: 'center', gap: 12 * u, fontFamily: fam, boxSizing: 'border-box' }}>
                {/* check toggle */}
                <div
                  onPointerDown={(e) => { e.stopPropagation(); }}
                  onClick={(e) => { e.stopPropagation(); onToggleCheck?.(el.id); }}
                  onDoubleClick={(e) => e.stopPropagation()}
                  style={{
                    flexShrink: 0,
                    width: circle,
                    height: circle,
                    borderRadius: '50%',
                    background: el.check ? (el.color || '#1A1A1A') : 'transparent',
                    border: el.check ? 'none' : `${2 * u}px solid #c4c0b8`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: onToggleCheck ? 'pointer' : 'default',
                    pointerEvents: onToggleCheck ? 'auto' : 'none',
                  }}
                  title={onToggleCheck ? 'Click to flag / unflag' : undefined}
                >
                  {el.check && (
                    <svg width={circle * 0.5} height={circle * 0.5} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  )}
                </div>
                {/* emoji + name + caption */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 * u, paddingTop: 14 * u, paddingBottom: 14 * u }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 * u }}>
                    <span style={{ fontSize: 19 * u, lineHeight: 1 }}>{el.emoji}</span>
                    {editing ? (
                      <EditingBox value={name} onChange={(v) => onTextChange?.(el.id, v)} onDone={() => onEditEnd?.()} style={{ fontFamily: fam, fontSize: 16 * u, fontWeight: 700, color: el.color || '#1A1A1A' }} />
                    ) : (
                      <span style={{ fontSize: 16 * u, fontWeight: 700, color: el.color || '#1A1A1A', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
                    )}
                  </div>
                  {el.cardCaption && (
                    <span style={{ fontFamily: MONO, fontSize: 11 * u, letterSpacing: '0.08em', color: '#a8a49c' }}>{el.cardCaption}</span>
                  )}
                </div>
                {/* mini history heatmap (hidden when cols < 1) */}
                {cols >= 1 && (
                <div style={{ flexShrink: 0, display: 'grid', gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`, gap, width: heatW }}>
                  {Array.from({ length: cols * rows }).map((_, i) => {
                    if (i === todayIdx) {
                      return <div key={i} style={{ width: cellSize, height: cellSize, borderRadius: cellSize * 0.28, border: `${1.5 * u}px dashed #b8b4ac`, boxSizing: 'border-box' }} />;
                    }
                    return <div key={i} style={{ width: cellSize, height: cellSize, borderRadius: cellSize * 0.28, background: cellFilled(i + (el.emoji || '').length * 7, el.fill ?? 0.45) ? active : idle }} />;
                  })}
                </div>
                )}
              </div>
            );
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
            if (el.framed) {
              content = <HeatmapCard el={el} sf={sf} />;
            } else {
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
            }
          } else if (el.kind === 'barchart') {
            content = <BarChartCard el={el} sf={sf} />;
          } else if (el.kind === 'linechart') {
            content = <LineChartCard el={el} sf={sf} />;
          } else if (el.kind === 'streak') {
            content = <StreakCard el={el} sf={sf} />;
          } else if (el.kind === 'notification') {
            content = <NotificationCard el={el} sf={sf} editing={editing} onTextChange={onTextChange} onEditEnd={onEditEnd} />;
          } else if (el.kind === 'widget') {
            content = <WidgetCard el={el} sf={sf} editing={editing} onTextChange={onTextChange} onEditEnd={onEditEnd} />;
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
