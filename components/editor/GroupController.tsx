'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { SlideElement } from '@/types';

interface Props {
  canvasWrapperRef: React.RefObject<HTMLDivElement | null>;
  stageRef: React.RefObject<HTMLDivElement | null>;
  /** screen_px → stage_px */
  computedScale: number;
  /** stage_px → baseline_px (targetW / BASE_W) */
  scaleFactor: number;
  /** The selected elements (with x, y, scale in baseline coords). */
  elements: SlideElement[];
  /** Apply absolute transforms to many elements at once. */
  onApply: (patches: Record<string, Partial<SlideElement>>) => void;
  onDelete: () => void;
  /** Bumped to force re-measure. */
  measureTick: number;
}

type Box = { left: number; top: number; width: number; height: number };
type Mode = 'move' | 'scale' | null;

export default function GroupController({ canvasWrapperRef, stageRef, computedScale, scaleFactor, elements, onApply, onDelete, measureTick }: Props) {
  const [box, setBox] = useState<Box | null>(null);
  const drag = useRef<{
    mode: Mode;
    startX: number;
    startY: number;
    cx: number; // group screen centre
    cy: number;
    initialDist: number;
    snapshot: { id: string; x: number; y: number; scale: number }[];
    centroidX: number; // baseline centroid
    centroidY: number;
  } | null>(null);

  const measure = useCallback(() => {
    if (!stageRef.current || !canvasWrapperRef.current || elements.length < 2) {
      setBox(null);
      return;
    }
    const wrap = canvasWrapperRef.current.getBoundingClientRect();
    let minL = Infinity, minT = Infinity, maxR = -Infinity, maxB = -Infinity;
    let found = 0;
    elements.forEach((el) => {
      const node = stageRef.current!.querySelector(`[data-element="el:${el.id}"]`) as HTMLElement | null;
      if (!node) return;
      const r = node.getBoundingClientRect();
      minL = Math.min(minL, r.left); minT = Math.min(minT, r.top);
      maxR = Math.max(maxR, r.right); maxB = Math.max(maxB, r.bottom);
      found++;
    });
    if (found < 2) { setBox(null); return; }
    setBox({ left: minL - wrap.left, top: minT - wrap.top, width: maxR - minL, height: maxB - minT });
  }, [elements, stageRef, canvasWrapperRef]);

  useEffect(() => { measure(); }, [measure, measureTick]);
  useEffect(() => {
    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [measure]);

  useEffect(() => {
    const denom = computedScale * scaleFactor || 1;
    const onMove = (e: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      if (d.mode === 'move') {
        const dx = (e.clientX - d.startX) / denom;
        const dy = (e.clientY - d.startY) / denom;
        const patches: Record<string, Partial<SlideElement>> = {};
        d.snapshot.forEach((s) => { patches[s.id] = { x: s.x + dx, y: s.y + dy }; });
        onApply(patches);
      } else if (d.mode === 'scale') {
        const dist = Math.hypot(e.clientX - d.cx, e.clientY - d.cy);
        const f = Math.max(0.2, Math.min(6, dist / Math.max(d.initialDist, 1)));
        const patches: Record<string, Partial<SlideElement>> = {};
        d.snapshot.forEach((s) => {
          patches[s.id] = {
            x: d.centroidX + (s.x - d.centroidX) * f,
            y: d.centroidY + (s.y - d.centroidY) * f,
            scale: Math.max(0.1, Math.min(8, s.scale * f)),
          };
        });
        onApply(patches);
      }
    };
    const onUp = () => { drag.current = null; };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
  }, [computedScale, scaleFactor, onApply]);

  if (!box || elements.length < 2) return null;

  const start = (mode: Mode) => (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!canvasWrapperRef.current) return;
    const wrap = canvasWrapperRef.current.getBoundingClientRect();
    const cx = wrap.left + box.left + box.width / 2;
    const cy = wrap.top + box.top + box.height / 2;
    const centroidX = elements.reduce((a, el) => a + el.x, 0) / elements.length;
    const centroidY = elements.reduce((a, el) => a + el.y, 0) / elements.length;
    drag.current = {
      mode,
      startX: e.clientX,
      startY: e.clientY,
      cx, cy,
      initialDist: Math.hypot(e.clientX - cx, e.clientY - cy),
      snapshot: elements.map((el) => ({ id: el.id, x: el.x, y: el.y, scale: el.scale || 1 })),
      centroidX, centroidY,
    };
  };

  const pad = 8;
  const left = box.left - pad, top = box.top - pad;
  const w = box.width + pad * 2, h = box.height + pad * 2;
  const hs = 13;

  return (
    <div style={{ position: 'absolute', left, top, width: w, height: h, pointerEvents: 'none', zIndex: 31 }}>
      <div
        onPointerDown={start('move')}
        style={{ position: 'absolute', inset: 0, border: '1.5px dashed var(--norte-primary)', borderRadius: 6, background: 'rgba(91,95,237,0.05)', cursor: 'move', pointerEvents: 'auto', touchAction: 'none' }}
      />
      <div style={{ position: 'absolute', top: -22, left: 0, background: 'var(--norte-primary)', color: 'white', fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, fontFamily: 'var(--font-archivo), sans-serif', whiteSpace: 'nowrap' }}>
        {elements.length} SELECTED
      </div>
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        style={{ position: 'absolute', top: -22, right: 0, background: 'white', color: '#DC2626', border: '1px solid #DC2626', fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 4, cursor: 'pointer', pointerEvents: 'auto' }}
        title="Delete all selected (Del)"
      >
        Delete
      </button>
      {/* proportional scale handle (bottom-right) */}
      <div
        onPointerDown={start('scale')}
        style={{ position: 'absolute', right: -hs / 2, bottom: -hs / 2, width: hs, height: hs, borderRadius: '50%', background: 'var(--norte-primary)', border: '2px solid white', cursor: 'nwse-resize', pointerEvents: 'auto', boxShadow: '0 2px 6px rgba(0,0,0,0.2)', touchAction: 'none' }}
        title="Drag to resize all selected together"
      />
      {[{ left: -hs / 2, top: -hs / 2 }, { right: -hs / 2, top: -hs / 2 }, { left: -hs / 2, bottom: -hs / 2 }].map((p, i) => (
        <div key={i} style={{ position: 'absolute', width: hs - 5, height: hs - 5, borderRadius: 2, background: 'white', border: '2px solid var(--norte-primary)', ...p }} />
      ))}
    </div>
  );
}
