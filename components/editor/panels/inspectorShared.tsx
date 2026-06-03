'use client';

import React from 'react';

export function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className={`h-6 w-10 rounded-full transition-all ${on ? 'bg-norte-primary' : 'bg-muted'}`}>
      <span className={`block w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );
}

export function TextField({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-9 px-2.5 text-sm bg-surface border border-border-default rounded-md text-secondary focus:border-norte-primary focus:outline-none"
    />
  );
}

/** A titled block used to group related controls inside an inspector. */
export function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="border-t border-border-default pt-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="section-label">{title}</div>
        {action}
      </div>
      {children}
    </div>
  );
}

/** Dispatch a request to the active SlideCanvas to align the current selection. */
export function requestAlign(edge: 'left' | 'hcenter' | 'right' | 'top' | 'vcenter' | 'bottom', relativeTo: 'screen' | 'selection') {
  window.dispatchEvent(new CustomEvent('sf:align', { detail: { edge, relativeTo } }));
}

const ALIGN_BTNS: { edge: 'left' | 'hcenter' | 'right' | 'top' | 'vcenter' | 'bottom'; glyph: React.ReactNode; title: string }[] = [
  { edge: 'left', title: 'Align left', glyph: <AlignGlyph kind="left" /> },
  { edge: 'hcenter', title: 'Center horizontally', glyph: <AlignGlyph kind="hcenter" /> },
  { edge: 'right', title: 'Align right', glyph: <AlignGlyph kind="right" /> },
  { edge: 'top', title: 'Align top', glyph: <AlignGlyph kind="top" /> },
  { edge: 'vcenter', title: 'Center vertically', glyph: <AlignGlyph kind="vcenter" /> },
  { edge: 'bottom', title: 'Align bottom', glyph: <AlignGlyph kind="bottom" /> },
];

/** A 6-button alignment row. */
export function AlignRow({ relativeTo }: { relativeTo: 'screen' | 'selection' }) {
  return (
    <div className="grid grid-cols-6 gap-1 bg-overlay rounded-md p-1 border border-border-default">
      {ALIGN_BTNS.map((b) => (
        <button
          key={b.edge}
          title={b.title}
          onClick={() => requestAlign(b.edge, relativeTo)}
          className="h-7 rounded flex items-center justify-center text-secondary hover:bg-surface hover:text-norte-primary"
        >
          {b.glyph}
        </button>
      ))}
    </div>
  );
}

function AlignGlyph({ kind }: { kind: 'left' | 'hcenter' | 'right' | 'top' | 'vcenter' | 'bottom' }) {
  const s = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const };
  switch (kind) {
    case 'left':
      return (<svg {...s}><line x1="4" y1="3" x2="4" y2="21" /><rect x="7" y="6" width="11" height="4" rx="1" fill="currentColor" stroke="none" /><rect x="7" y="14" width="7" height="4" rx="1" fill="currentColor" stroke="none" /></svg>);
    case 'right':
      return (<svg {...s}><line x1="20" y1="3" x2="20" y2="21" /><rect x="6" y="6" width="11" height="4" rx="1" fill="currentColor" stroke="none" /><rect x="10" y="14" width="7" height="4" rx="1" fill="currentColor" stroke="none" /></svg>);
    case 'hcenter':
      return (<svg {...s}><line x1="12" y1="3" x2="12" y2="21" /><rect x="6.5" y="6" width="11" height="4" rx="1" fill="currentColor" stroke="none" /><rect x="8.5" y="14" width="7" height="4" rx="1" fill="currentColor" stroke="none" /></svg>);
    case 'top':
      return (<svg {...s}><line x1="3" y1="4" x2="21" y2="4" /><rect x="6" y="7" width="4" height="11" rx="1" fill="currentColor" stroke="none" /><rect x="14" y="7" width="4" height="7" rx="1" fill="currentColor" stroke="none" /></svg>);
    case 'bottom':
      return (<svg {...s}><line x1="3" y1="20" x2="21" y2="20" /><rect x="6" y="6" width="4" height="11" rx="1" fill="currentColor" stroke="none" /><rect x="14" y="10" width="4" height="7" rx="1" fill="currentColor" stroke="none" /></svg>);
    case 'vcenter':
      return (<svg {...s}><line x1="3" y1="12" x2="21" y2="12" /><rect x="6" y="6.5" width="4" height="11" rx="1" fill="currentColor" stroke="none" /><rect x="14" y="8.5" width="4" height="7" rx="1" fill="currentColor" stroke="none" /></svg>);
  }
}
