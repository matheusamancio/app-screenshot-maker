'use client';

import React, { useEffect, useState } from 'react';
import { useProjectStore } from '@/store/projectStore';
import TopNav from '@/components/editor/TopNav';
import LeftRail from '@/components/editor/LeftRail';
import MultiSlideCanvas from '@/components/editor/MultiSlideCanvas';
import RightPanel from '@/components/editor/RightPanel';
import SetupModal from '@/components/editor/modals/SetupModal';
import GlobalsModal from '@/components/editor/modals/GlobalsModal';
import LocalizeModal from '@/components/editor/modals/LocalizeModal';
import ExportModal from '@/components/editor/modals/ExportModal';
import TemplatesModal from '@/components/editor/modals/TemplatesModal';
import AIGenerateModal from '@/components/editor/modals/AIGenerateModal';
import { ToastProvider } from '@/components/ui/Toast';

function Editor() {
  const slides = useProjectStore((s) => s.slides);
  const activeSlideId = useProjectStore((s) => s.activeSlideId);
  const [hydrated, setHydrated] = useState(false);

  const [setupOpen, setSetupOpen] = useState(false);
  const [globalsOpen, setGlobalsOpen] = useState(false);
  const [localizeOpen, setLocalizeOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [aiOpen, setAIOpen] = useState(false);

  useEffect(() => setHydrated(true), []);

  const activeSlide = slides.find((s) => s.id === activeSlideId) || slides[0];

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
        <LeftRail onOpenTemplates={() => setTemplatesOpen(true)} />
        <MultiSlideCanvas />
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
