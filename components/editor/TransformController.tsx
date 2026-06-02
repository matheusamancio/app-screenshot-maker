'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { ElementTransform, TransformableElement } from '@/types';
import { IDENTITY_TRANSFORM } from '@/types';

interface ScreenBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface Props {
  /** Wrapper visible to the user (where the overlay is positioned). */
  canvasWrapperRef: React.RefObject<HTMLDivElement | null>;
  /** Inner stage rendered at full pixel resolution before scale. */
  stageRef: React.RefObject<HTMLDivElement | null>;
  /** stage_px → logical_baseline_px conversion (targetW / BASE_W). */
  scaleFactor: number;
  /** screen_px → stage_px conversion. */
  computedScale: number;
  selected: TransformableElement | null;
  transform: ElementTransform;
  onChange: (patch: Partial<ElementTransform>) => void;
  onReset: () => void;
  /** Bumped externally to force re-measure when the underlying DOM changes. */
  measureTick: number;
}

type DragMode = 'move' | 'rotate' | 'scale' | null;

export default function TransformController({
  canvasWrapperRef,
  stageRef,
  scaleFactor,
  computedScale,
  selected,
  transform,
  onChange,
  onReset,
  measureTick,
}: Props) {
  const [box, setBox] = useState<ScreenBox | null>(null);
  const dragRef = useRef<{
    mode: DragMode;
    startX: number;
    startY: number;
    startTransform: ElementTransform;
    centerScreenX: number;
    centerScreenY: number;
    initialAngle: number;
    initialDist: number;
  } | null>(null);

  // Measure the selected element relative to the canvas wrapper.
  // Uses an unrotated bounding box so handles align cleanly while we re-rotate
  // the selection chrome separately to match.
  const measure = useCallback(() => {
    if (!selected || !stageRef.current || !canvasWrapperRef.current) {
      setBox(null);
      return;
    }
    const el = stageRef.current.querySelector(`[data-element="${selected}"]`) as HTMLElement | null;
    if (!el) {
      setBox(null);
      return;
    }
    const wrapperRect = canvasWrapperRef.current.getBoundingClientRect();
    // Temporarily strip rotation to get the axis-aligned box, then re-apply
    // the rotation visually on the overlay. We snapshot the current transform
    // and write it back.
    const prevTransform = el.style.transform;
    const stripped = prevTransform.replace(/rotate\([^)]*\)/g, 'rotate(0deg)');
    el.style.transform = stripped;
    const elRect = el.getBoundingClientRect();
    el.style.transform = prevTransform;

    setBox({
      left: elRect.left - wrapperRect.left,
      top: elRect.top - wrapperRect.top,
      width: elRect.width,
      height: elRect.height,
    });
  }, [selected, stageRef, canvasWrapperRef]);

  useEffect(() => {
    measure();
  }, [measure, measureTick, transform.x, transform.y, transform.scale]);

  useEffect(() => {
    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [measure]);

  // Window-level drag handlers.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dxScreen = e.clientX - drag.startX;
      const dyScreen = e.clientY - drag.startY;
      const denom = computedScale * scaleFactor || 1;
      const dxLogical = dxScreen / denom;
      const dyLogical = dyScreen / denom;

      if (drag.mode === 'move') {
        onChange({
          x: drag.startTransform.x + dxLogical,
          y: drag.startTransform.y + dyLogical,
        });
      } else if (drag.mode === 'rotate') {
        const angle = (Math.atan2(e.clientY - drag.centerScreenY, e.clientX - drag.centerScreenX) * 180) / Math.PI;
        const delta = angle - drag.initialAngle;
        let next = drag.startTransform.rotation + delta;
        if (e.shiftKey) next = Math.round(next / 5) * 5;
        onChange({ rotation: next });
      } else if (drag.mode === 'scale') {
        const dist = Math.hypot(e.clientX - drag.centerScreenX, e.clientY - drag.centerScreenY);
        const ratio = dist / Math.max(drag.initialDist, 1);
        const next = Math.max(0.2, Math.min(4, drag.startTransform.scale * ratio));
        onChange({ scale: next });
      }
    };
    const onUp = () => {
      dragRef.current = null;
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [computedScale, scaleFactor, onChange]);

  if (!selected || !box) return null;

  const startDrag = (mode: DragMode) => (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!canvasWrapperRef.current) return;
    const wrapperRect = canvasWrapperRef.current.getBoundingClientRect();
    const cx = wrapperRect.left + box.left + box.width / 2;
    const cy = wrapperRect.top + box.top + box.height / 2;
    dragRef.current = {
      mode,
      startX: e.clientX,
      startY: e.clientY,
      startTransform: { ...IDENTITY_TRANSFORM, ...transform },
      centerScreenX: cx,
      centerScreenY: cy,
      initialAngle: (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI,
      initialDist: Math.hypot(e.clientX - cx, e.clientY - cy),
    };
  };

  const padding = 6;
  const handleSize = 12;
  const w = box.width + padding * 2;
  const h = box.height + padding * 2;
  const left = box.left - padding;
  const top = box.top - padding;

  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        width: w,
        height: h,
        transform: transform.rotation ? `rotate(${transform.rotation}deg)` : undefined,
        transformOrigin: 'center center',
        pointerEvents: 'none',
        zIndex: 30,
      }}
    >
      {/* Selection outline + drag area */}
      <div
        onPointerDown={startDrag('move')}
        style={{
          position: 'absolute',
          inset: 0,
          border: '2px solid var(--norte-primary)',
          borderRadius: 6,
          background: 'rgba(91,95,237,0.04)',
          cursor: 'move',
          pointerEvents: 'auto',
          touchAction: 'none',
        }}
      />
      {/* Element label */}
      <div
        style={{
          position: 'absolute',
          top: -22,
          left: 0,
          background: 'var(--norte-primary)',
          color: 'white',
          fontSize: 10,
          fontWeight: 600,
          padding: '2px 6px',
          borderRadius: 4,
          pointerEvents: 'none',
          textTransform: 'uppercase',
          letterSpacing: 0.4,
          fontFamily: 'var(--font-archivo), sans-serif',
        }}
      >
        {selected}
      </div>
      {/* Reset button */}
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onReset();
        }}
        style={{
          position: 'absolute',
          top: -22,
          left: selected.length * 8 + 18,
          background: 'white',
          color: 'var(--norte-primary)',
          border: '1px solid var(--norte-primary)',
          fontSize: 10,
          fontWeight: 600,
          padding: '1px 6px',
          borderRadius: 4,
          pointerEvents: 'auto',
          cursor: 'pointer',
        }}
        title="Reset transform"
      >
        Reset
      </button>
      {/* Rotation handle */}
      <div
        onPointerDown={startDrag('rotate')}
        style={{
          position: 'absolute',
          top: -28,
          left: w / 2 - handleSize / 2,
          width: handleSize,
          height: handleSize,
          borderRadius: '50%',
          background: 'white',
          border: '2px solid var(--norte-primary)',
          cursor: 'grab',
          pointerEvents: 'auto',
          boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
          touchAction: 'none',
        }}
        title="Drag to rotate · Shift to snap 5°"
      />
      {/* Connector line */}
      <div
        style={{
          position: 'absolute',
          top: -16,
          left: w / 2 - 1,
          width: 2,
          height: 16,
          background: 'var(--norte-primary)',
          pointerEvents: 'none',
        }}
      />
      {/* Scale handle (bottom-right) */}
      <div
        onPointerDown={startDrag('scale')}
        style={{
          position: 'absolute',
          right: -handleSize / 2,
          bottom: -handleSize / 2,
          width: handleSize,
          height: handleSize,
          borderRadius: 3,
          background: 'white',
          border: '2px solid var(--norte-primary)',
          cursor: 'nwse-resize',
          pointerEvents: 'auto',
          boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
          touchAction: 'none',
        }}
        title="Drag to scale"
      />
      {/* Decorative corners */}
      {[
        { left: -handleSize / 2, top: -handleSize / 2 },
        { right: -handleSize / 2, top: -handleSize / 2 },
        { left: -handleSize / 2, bottom: -handleSize / 2 },
      ].map((pos, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: handleSize - 4,
            height: handleSize - 4,
            borderRadius: 2,
            background: 'white',
            border: '2px solid var(--norte-primary)',
            ...pos,
            pointerEvents: 'none',
          }}
        />
      ))}
    </div>
  );
}
