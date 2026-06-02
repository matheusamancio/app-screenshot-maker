'use client';

import React, { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useProjectStore } from '@/store/projectStore';
import { fileToBase64 } from '@/lib/utils';
import TopNav from '@/components/editor/TopNav';
import SlideStrip from '@/components/editor/SlideStrip';
import CanvasPreview from '@/components/editor/CanvasPreview';
import RightPanel from '@/components/editor/RightPanel';
import SetupModal from '@/components/editor/modals/SetupModal';
import GlobalsModal from '@/components/editor/modals/GlobalsModal';
import LocalizeModal from '@/components/editor/modals/LocalizeModal';
import ExportModal from '@/components/editor/modals/ExportModal';
import TemplatesModal from '@/components/editor/modals/TemplatesModal';
import AIGenerateModal from '@/components/editor/modals/AIGenerateModal';
import { ToastProvider, useToast } from '@/components/ui/Toast';

function Editor() {
  const slides = useProjectStore((s) => s.slides);
  const activeSlideId = useProjectStore((s) => s.activeSlideId);
  const updateSlide = useProjectStore((s) => s.updateSlide);
  const activeLanguage = useProjectStore((s) => s.activeLanguage);
  const { toast } = useToast();

  const [setupOpen, setSetupOpen] = useState(false);
  const [globalsOpen, setGlobalsOpen] = useState(false);
  const [localizeOpen, setLocalizeOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [aiOpen, setAIOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  const isFreshProject =
    slides.length === 1 &&
    !slides[0].screenshot &&
    slides[0].title.text === 'Build something\nbeautiful.';

  const activeSlide = slides.find((s) => s.id === activeSlideId) || slides[0];

  const onDrop = async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    const b64 = await fileToBase64(f);
    updateSlide(activeSlide.id, { screenshot: b64 });
    toast('Screenshot loaded', 'success');
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
    noClick: true,
    noKeyboard: true,
  });

  if (!hydrated || !activeSlide) {
    return <div className="h-screen w-screen flex items-center justify-center text-text-muted">Loading…</div>;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-base">
      <TopNav
        onOpenGlobals={() => setGlobalsOpen(true)}
        onOpenSetup={() => setSetupOpen(true)}
        onOpenLocalize={() => setLocalizeOpen(true)}
        onOpenExport={() => setExportOpen(true)}
        onOpenTemplates={() => setTemplatesOpen(true)}
        onOpenAI={() => setAIOpen(true)}
      />

      <div className="flex-1 flex min-h-0">
        <SlideStrip />

        <main {...getRootProps()} className="flex-1 relative outline-none">
          <input {...getInputProps()} />
          <CanvasPreview slide={activeSlide} language={activeLanguage} />

          {isFreshProject && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 bg-surface border border-border-default rounded-lg shadow-md px-4 py-2.5 flex items-center gap-3 fade-in">
              <span className="text-sm text-secondary">
                <span className="font-sora font-semibold text-primary">Start faster</span> — patterns or AI fill the deck for you
              </span>
              <button
                onClick={() => setAIOpen(true)}
                className="h-8 px-3 rounded-md bg-gradient-to-r from-norte-primary to-norte-secondary text-white text-xs font-sora font-semibold hover:opacity-90 flex items-center gap-1 shadow-sm"
              >
                ✦ Build deck
              </button>
              <button
                onClick={() => setTemplatesOpen(true)}
                className="h-8 px-3 rounded-md bg-norte-primary-light text-norte-primary text-xs font-sora font-semibold hover:bg-norte-primary/15"
              >
                Browse templates →
              </button>
            </div>
          )}

          {isDragActive && (
            <div className="absolute inset-4 z-50 rounded-xl border-2 border-dashed border-norte-primary bg-norte-primary-light/70 flex items-center justify-center pointer-events-none">
              <div className="bg-surface rounded-md px-4 py-3 shadow-md flex items-center gap-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5B5FED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <div>
                  <div className="text-sm font-semibold text-primary font-sora">Drop to upload</div>
                  <div className="text-xs text-text-muted">PNG or JPG screenshot</div>
                </div>
              </div>
            </div>
          )}
        </main>

        <RightPanel slide={activeSlide} />
      </div>

      <SetupModal open={setupOpen} onClose={() => setSetupOpen(false)} />
      <GlobalsModal open={globalsOpen} onClose={() => setGlobalsOpen(false)} />
      <LocalizeModal open={localizeOpen} onClose={() => setLocalizeOpen(false)} />
      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} />
      <TemplatesModal open={templatesOpen} onClose={() => setTemplatesOpen(false)} />
      <AIGenerateModal open={aiOpen} onClose={() => setAIOpen(false)} />
    </div>
  );
}

export default function Page() {
  return (
    <ToastProvider>
      <Editor />
    </ToastProvider>
  );
}
