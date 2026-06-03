'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface MenuItem {
  label?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  divider?: boolean;
  submenu?: MenuItem[];
}

interface Props {
  x: number;
  y: number;
  items: MenuItem[];
  onClose: () => void;
}

export default function ContextMenu({ x, y, items, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('pointerdown', onDown, true);
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('pointerdown', onDown, true); window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  // keep within viewport
  const maxX = typeof window !== 'undefined' ? window.innerWidth - 220 : x;
  const left = Math.min(x, maxX);
  const top = Math.min(y, typeof window !== 'undefined' ? window.innerHeight - 360 : y);

  const Row = ({ it, i }: { it: MenuItem; i: number }) => {
    if (it.divider) return <div className="my-1 h-px bg-border-default" />;
    const hasSub = !!it.submenu?.length;
    return (
      <div
        className="relative"
        onPointerEnter={() => setOpen(hasSub ? i : null)}
      >
        <button
          onClick={() => { if (!hasSub) { it.onClick?.(); onClose(); } }}
          className={`w-full flex items-center justify-between gap-3 px-3 py-1.5 text-left text-[13px] rounded-md ${it.danger ? 'text-[#DC2626] hover:bg-[#DC2626]/10' : 'text-secondary hover:bg-norte-primary-light hover:text-norte-primary'}`}
        >
          <span className="flex items-center gap-2">{it.icon}{it.label}</span>
          {hasSub && <span className="text-text-muted">›</span>}
        </button>
        {hasSub && open === i && (
          <div className="absolute top-0 left-full ml-1 min-w-[180px] bg-surface border border-border-default rounded-lg shadow-canvas py-1 z-10">
            {it.submenu!.map((s, j) => <Row key={j} it={s} i={1000 + j} />)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={ref}
      className="fixed z-[200] min-w-[200px] bg-surface border border-border-default rounded-lg shadow-canvas py-1 fade-in"
      style={{ left, top }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map((it, i) => <Row key={i} it={it} i={i} />)}
    </div>
  );
}
