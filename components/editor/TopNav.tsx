'use client';

import React from 'react';
import { useProjectStore } from '@/store/projectStore';
import { DEVICE_SIZES } from '@/lib/deviceSizes';
import Dropdown from '../ui/Dropdown';

interface Props {
  onOpenGlobals: () => void;
  onOpenSetup: () => void;
  onOpenLocalize: () => void;
  onOpenExport: () => void;
  onOpenTemplates: () => void;
  onOpenAI: () => void;
}

export default function TopNav({ onOpenGlobals, onOpenSetup, onOpenLocalize, onOpenExport, onOpenTemplates, onOpenAI }: Props) {
  const previewDeviceId = useProjectStore((s) => s.previewDeviceId);
  const setPreviewDevice = useProjectStore((s) => s.setPreviewDevice);
  const projectName = useProjectStore((s) => s.name);

  const deviceOptions = DEVICE_SIZES.map((d) => ({
    value: d.id,
    label: `${d.label} · ${d.width}×${d.height}`,
    group: d.platform === 'ios' ? 'iOS' : 'Android',
    badge: d.required ? 'Required' : '',
  }));

  return (
    <header className="h-14 bg-surface border-b border-border-default shadow-sm flex items-center px-4 gap-4 shrink-0">
      <div className="flex items-center gap-2.5">
        <LogoMark />
        <div className="leading-tight">
          <div className="font-sora font-semibold text-[15px] text-primary">ScreenForge</div>
          <div className="text-[10px] text-text-muted -mt-0.5 font-medium tracking-wider uppercase">Norte</div>
        </div>
      </div>

      <div className="h-6 w-px bg-border-default mx-1" />

      <nav className="flex items-center gap-1">
        <button
          onClick={onOpenAI}
          className="h-8 px-3 rounded-md text-sm font-sora font-semibold text-white bg-gradient-to-r from-norte-primary to-norte-secondary hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm"
        >
          <span className="text-base leading-none">✦</span>
          Build deck
        </button>
        <button
          onClick={onOpenTemplates}
          className="h-8 px-3 rounded-md text-sm font-sora font-semibold text-norte-primary bg-norte-primary-light hover:bg-norte-primary/15 transition-all flex items-center gap-1.5"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="9" rx="1" />
            <rect x="14" y="3" width="7" height="5" rx="1" />
            <rect x="14" y="12" width="7" height="9" rx="1" />
            <rect x="3" y="16" width="7" height="5" rx="1" />
          </svg>
          Templates
        </button>
        <NavButton onClick={onOpenGlobals} label="Globals" />
        <NavButton onClick={onOpenSetup} label="Setup" />
        <NavButton onClick={onOpenLocalize} label="Localize" />
      </nav>

      <div className="ml-3 text-sm text-text-muted truncate max-w-[200px]">{projectName}</div>

      <div className="ml-auto flex items-center gap-3">
        <div className="text-[11px] text-text-muted font-medium uppercase tracking-wide">Preview</div>
        <div className="w-72">
          <Dropdown value={previewDeviceId} onChange={setPreviewDevice} options={deviceOptions} />
        </div>
        <button
          onClick={onOpenExport}
          className="h-9 px-4 rounded-md bg-norte-primary hover:bg-norte-primary-hover text-white font-sora font-semibold text-sm flex items-center gap-1.5 shadow-sm transition-all"
        >
          Export
          <span className="text-base leading-none">→</span>
        </button>
      </div>
    </header>
  );
}

function NavButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="h-8 px-3 rounded-md text-sm font-medium text-secondary hover:text-primary hover:bg-overlay transition-all"
    >
      {label}
    </button>
  );
}

function LogoMark() {
  return (
    <div className="w-8 h-8 rounded-md bg-norte-primary flex items-center justify-center shadow-sm">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="white" stroke="none" />
      </svg>
    </div>
  );
}
