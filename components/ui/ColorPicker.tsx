'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import { useProjectStore } from '@/store/projectStore';

interface Props {
  color: string;
  onChange: (c: string) => void;
  label?: string;
}

const POP_W = 224;
const POP_H = 332;

/** A small default palette (Norte brand + neutrals) always available. */
const PRESET_COLORS = ['#111111', '#1A1A1A', '#6B6B6B', '#FFFFFF', '#F4F2ED', '#E8923C', '#6F7D5E', '#7C6FD6', '#C4AE7A', '#5B5FED'];

export default function ColorPicker({ color, onChange, label }: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const recentColors = useProjectStore((s) => s.recentColors || []);
  const addRecentColor = useProjectStore((s) => s.addRecentColor);
  const colorRef = useRef(color);
  colorRef.current = color;
  const wasOpen = useRef(false);

  // Record the chosen colour as "recently used" when the picker closes.
  useEffect(() => {
    if (wasOpen.current && !open) addRecentColor(colorRef.current);
    wasOpen.current = open;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Anchor the (portalled) popover to the swatch, clamped to the viewport so it
  // never gets clipped by the scrolling right panel.
  const place = () => {
    const b = btnRef.current?.getBoundingClientRect();
    if (!b) return;
    let left = b.right - POP_W; // right-aligned to the swatch
    left = Math.max(8, Math.min(left, window.innerWidth - POP_W - 8));
    let top = b.bottom + 8;
    if (top + POP_H > window.innerHeight - 8) top = Math.max(8, b.top - POP_H - 8);
    setPos({ top, left });
  };

  useLayoutEffect(() => {
    if (open) place();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const supportsEyedropper = typeof window !== 'undefined' && 'EyeDropper' in window;
  const pickFromScreen = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ed = new (window as any).EyeDropper();
      const res = await ed.open();
      if (res?.sRGBHex) onChange(res.sRGBHex);
    } catch {
      /* user cancelled (Esc) — ignore */
    }
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!btnRef.current?.contains(t) && !popRef.current?.contains(t)) setOpen(false);
    };
    const reflow = () => place();
    document.addEventListener('mousedown', onDown);
    window.addEventListener('scroll', reflow, true);
    window.addEventListener('resize', reflow);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('scroll', reflow, true);
      window.removeEventListener('resize', reflow);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen((o) => !o)}
        className="w-full h-9 px-2 bg-overlay border border-border-default rounded-md flex items-center gap-2 text-sm text-secondary hover:border-border-strong"
      >
        <span className="w-5 h-5 rounded border border-border-default" style={{ background: color }} />
        <span className="font-mono text-xs uppercase">{color.replace('#', '')}</span>
        {label && <span className="ml-auto text-text-muted text-xs">{label}</span>}
      </button>
      {open &&
        createPortal(
          <div
            ref={popRef}
            className="bg-surface border border-border-default rounded-md shadow-lg p-3 fade-in cp-popover"
            style={{ position: 'fixed', top: pos.top, left: pos.left, width: POP_W, zIndex: 9999 }}
          >
            <HexColorPicker color={color} onChange={onChange} style={{ width: '100%' }} />
            <div className="mt-3 flex items-center gap-2">
              {supportsEyedropper && (
                <button
                  type="button"
                  onClick={pickFromScreen}
                  title="Pick a colour from anywhere on screen"
                  className="h-8 w-8 shrink-0 flex items-center justify-center bg-overlay border border-border-default rounded-md text-secondary hover:text-norte-primary hover:border-norte-primary"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m2 22 1-1h3l9-9" />
                    <path d="M3 21v-3l9-9" />
                    <path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z" />
                  </svg>
                </button>
              )}
              <HexColorInput
                color={color}
                onChange={onChange}
                prefixed
                className="flex-1 min-w-0 h-8 px-2 bg-overlay border border-border-default rounded-md text-sm font-mono uppercase outline-none"
              />
            </div>

            {recentColors.length > 0 && (
              <div className="mt-3">
                <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium mb-1.5">Used colours</div>
                <Swatches colors={recentColors} active={color} onPick={(c) => { onChange(c); addRecentColor(c); }} />
              </div>
            )}
            <div className="mt-3">
              <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium mb-1.5">Default</div>
              <Swatches colors={PRESET_COLORS} active={color} onPick={(c) => { onChange(c); addRecentColor(c); }} />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

function Swatches({ colors, active, onPick }: { colors: string[]; active: string; onPick: (c: string) => void }) {
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {colors.map((c, i) => {
        const isActive = c.toUpperCase() === (active || '').toUpperCase();
        return (
          <button
            key={`${c}-${i}`}
            type="button"
            title={c}
            onClick={() => onPick(c)}
            className={`w-6 h-6 rounded-full border ${isActive ? 'ring-2 ring-norte-primary ring-offset-1' : 'border-border-default'}`}
            style={{ background: c }}
          />
        );
      })}
    </div>
  );
}
