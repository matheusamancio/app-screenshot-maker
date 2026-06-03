'use client';

import React, { useEffect, useState } from 'react';
import type { Slide } from '@/types';
import { useProjectStore } from '@/store/projectStore';
import SlidePanel from './panels/SlidePanel';
import ElementInspector from './panels/ElementInspector';
import MultiInspector from './panels/MultiInspector';
import TitlePanel from './panels/TitlePanel';
import DevicePanel from './panels/DevicePanel';

interface Props {
  slide: Slide;
}

/**
 * Context-aware right panel. The `Selection` tab shows only the controls that
 * apply to whatever is currently selected (a component, multiple components, the
 * title, or the device). The `Slide` tab holds page-level settings (background,
 * layout, device, layers). The active tab follows the selection automatically
 * but can be switched manually.
 */
export default function RightPanel({ slide }: Props) {
  const selectedElementId = useProjectStore((s) => s.selectedElementId);
  const selectedIds = useProjectStore((s) => s.selectedIds || []);

  const multi = selectedIds.length > 1;
  const elId = !multi && selectedElementId?.startsWith('el:') ? selectedElementId.slice(3) : null;
  const isTitle = selectedElementId === 'title';
  const isDevice = selectedElementId === 'device';
  const hasSelection = multi || !!elId || isTitle || isDevice;

  const [tab, setTab] = useState<'selection' | 'slide'>('slide');
  // Follow the selection: jump to the inspector whenever the selection changes,
  // fall back to slide settings when nothing is selected.
  const selKey = multi ? `multi:${selectedIds.length}:${selectedIds.join(',')}` : selectedElementId || '';
  useEffect(() => {
    setTab(hasSelection ? 'selection' : 'slide');
  }, [selKey, hasSelection]);

  const el = elId ? (slide.elements || []).find((e) => e.id === elId) : undefined;

  return (
    <aside className="w-80 border-l border-border-default bg-surface flex flex-col">
      {/* Tab switch */}
      <div className="px-3 pt-3 pb-2 border-b border-border-default">
        <div className="grid grid-cols-2 gap-1 bg-overlay rounded-lg p-1 border border-border-default">
          <button
            onClick={() => setTab('selection')}
            disabled={!hasSelection}
            className={`h-7 rounded-md text-xs font-semibold transition-colors ${tab === 'selection' ? 'bg-surface text-norte-primary shadow-sm' : 'text-text-muted hover:text-secondary disabled:opacity-40 disabled:hover:text-text-muted'}`}
          >
            {selectionLabel(multi, selectedIds.length, elId, isTitle, isDevice)}
          </button>
          <button
            onClick={() => setTab('slide')}
            className={`h-7 rounded-md text-xs font-semibold transition-colors ${tab === 'slide' ? 'bg-surface text-norte-primary shadow-sm' : 'text-text-muted hover:text-secondary'}`}
          >
            Slide
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {tab === 'selection' ? (
          multi ? (
            <MultiInspector slide={slide} ids={selectedIds} />
          ) : el ? (
            <ElementInspector slide={slide} el={el} />
          ) : isTitle ? (
            <TitlePanel slide={slide} />
          ) : isDevice ? (
            <DevicePanel slide={slide} />
          ) : (
            <EmptyHint />
          )
        ) : (
          <SlidePanel slide={slide} />
        )}
      </div>
    </aside>
  );
}

function selectionLabel(multi: boolean, count: number, elId: string | null, isTitle: boolean, isDevice: boolean) {
  if (multi) return `${count} selected`;
  if (isTitle) return 'Title';
  if (isDevice) return 'Device';
  if (elId) return 'Selection';
  return 'Selection';
}

function EmptyHint() {
  return (
    <div className="flex flex-col items-center text-center gap-3 pt-10 px-4">
      <div className="w-12 h-12 rounded-xl bg-overlay border border-border-default flex items-center justify-center text-text-muted">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3l7 17 2-7 7-2z" /></svg>
      </div>
      <div className="text-sm font-semibold text-secondary font-sora">Nothing selected</div>
      <p className="text-[11px] text-text-muted leading-relaxed">Click a component on the canvas to edit it here, or use the <span className="font-semibold">Slide</span> tab for page settings.</p>
    </div>
  );
}
