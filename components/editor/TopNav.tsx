'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { DEVICE_SIZES } from '@/lib/deviceSizes';
import { LANGUAGES, isBaseLanguage } from '@/lib/presets';
import type { Language } from '@/types';
import Dropdown from '../ui/Dropdown';

interface Props {
  onOpenGlobals: () => void;
  onOpenSetup: () => void;
  onOpenLocalize: () => void;
  onOpenExport: () => void;
  onOpenTemplates: () => void;
  onOpenAI: () => void;
  onOpenProjects: () => void;
  onOpenSaveProject: () => void;
  onOpenSaveTemplate: () => void;
}

export default function TopNav({ onOpenGlobals, onOpenSetup, onOpenLocalize, onOpenExport, onOpenTemplates, onOpenAI, onOpenProjects, onOpenSaveProject, onOpenSaveTemplate }: Props) {
  const previewDeviceId = useProjectStore((s) => s.previewDeviceId);
  const setPreviewDevice = useProjectStore((s) => s.setPreviewDevice);
  const projectName = useProjectStore((s) => s.name);
  const enabledLanguages = useProjectStore((s) => s.enabledLanguages);
  const activeLanguage = useProjectStore((s) => s.activeLanguage);
  const setActiveLanguage = useProjectStore((s) => s.setActiveLanguage);

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
        <button
          onClick={onOpenProjects}
          className="h-8 px-3 rounded-md text-sm font-sora font-semibold text-secondary hover:text-primary hover:bg-overlay transition-all flex items-center gap-1.5"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="8" height="8" rx="1.5" />
            <rect x="13" y="3" width="8" height="8" rx="1.5" />
            <rect x="3" y="13" width="8" height="8" rx="1.5" />
            <rect x="13" y="13" width="8" height="8" rx="1.5" />
          </svg>
          Projects
        </button>
        <NavButton onClick={onOpenGlobals} label="Globals" />
        <NavButton onClick={onOpenSetup} label="Setup" />
        <NavButton onClick={onOpenLocalize} label="Localize" />
      </nav>

      <div className="ml-3 text-sm text-text-muted truncate max-w-[200px]">{projectName}</div>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={onOpenSaveProject}
          title="Save this board to your projects"
          className="h-9 px-3 rounded-md bg-muted border border-border-default text-secondary font-sora font-semibold text-sm flex items-center gap-1.5 hover:bg-overlay transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          Save project
        </button>
        <button
          onClick={onOpenSaveTemplate}
          title="Save this board as a reusable template"
          className="h-9 px-3 rounded-md bg-muted border border-border-default text-secondary font-sora font-semibold text-sm hover:bg-overlay transition-all"
        >
          Save as template
        </button>

        <div className="h-6 w-px bg-border-default mx-1" />

        <LanguageSwitcher
          languages={LANGUAGES.filter((l) => enabledLanguages.includes(l.code))}
          active={activeLanguage}
          onPick={setActiveLanguage}
        />

        <div className="h-6 w-px bg-border-default mx-1" />

        <div className="text-[11px] text-text-muted font-medium uppercase tracking-wide">Preview</div>
        <div className="w-56">
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

function LanguageSwitcher({
  languages,
  active,
  onPick,
}: {
  languages: { code: Language; label: string; name: string; rtl?: boolean }[];
  active: Language;
  onPick: (code: Language) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, []);
  const current = languages.find((l) => l.code === active) || languages[0];
  const isBase = !active || isBaseLanguage(active);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        title="Switch the language shown on the canvas (edit in this language)"
        className={`h-9 px-2.5 rounded-md flex items-center gap-1.5 text-sm font-sora font-semibold border transition-all ${
          isBase ? 'bg-muted border-border-default text-secondary hover:bg-overlay' : 'bg-norte-primary-light border-norte-primary text-norte-primary'
        }`}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18" />
        </svg>
        {current ? `${isBaseLanguage(current.code) ? '★ ' : ''}${current.label}` : 'Language'}
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-60 max-h-[60vh] overflow-y-auto bg-surface border border-border-default rounded-lg shadow-canvas py-1 z-[200] fade-in">
          {languages.map((l) => {
            const sel = l.code === active;
            return (
              <button
                key={l.code}
                onClick={() => { onPick(l.code); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-left text-[13px] ${sel ? 'bg-norte-primary-light text-norte-primary' : 'text-secondary hover:bg-overlay'}`}
              >
                <span className="w-14 shrink-0 font-mono text-[11px] font-semibold">{isBaseLanguage(l.code) ? '★' : ''}{l.label}</span>
                <span className="flex-1 min-w-0 truncate">{l.name}{l.rtl ? ' · RTL' : ''}</span>
                {sel && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
              </button>
            );
          })}
        </div>
      )}
    </div>
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
