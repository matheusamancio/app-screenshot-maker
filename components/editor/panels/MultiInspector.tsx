'use client';

import React from 'react';
import { useProjectStore } from '@/store/projectStore';
import type { Slide, SlideElement } from '@/types';
import Slider from '../../ui/Slider';
import { Section, AlignRow } from './inspectorShared';

/**
 * The multi-selection inspector — align/distribute the group, group/ungroup,
 * shared opacity + shadow applied to every selected element, and delete.
 */
export default function MultiInspector({ slide, ids }: { slide: Slide; ids: string[] }) {
  const applyElementPatches = useProjectStore((s) => s.applyElementPatches);
  const deleteSelectedElements = useProjectStore((s) => s.deleteSelectedElements);
  const groupElements = useProjectStore((s) => s.groupElements);
  const ungroupElements = useProjectStore((s) => s.ungroupElements);
  const setSelectedIds = useProjectStore((s) => s.setSelectedIds);

  const els = (slide.elements || []).filter((e) => ids.includes(e.id));
  const allGrouped = els.length > 0 && els.every((e) => e.groupId && e.groupId === els[0].groupId);
  // displayed appearance values come from the first element
  const first: SlideElement | undefined = els[0];

  const patchAll = (patch: Partial<SlideElement>) => {
    const map: Record<string, Partial<SlideElement>> = {};
    ids.forEach((id) => { map[id] = patch; });
    applyElementPatches(slide.id, map);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-primary font-sora">{ids.length} selected</div>
        <button onClick={() => deleteSelectedElements(slide.id)} className="w-7 h-7 rounded-md flex items-center justify-center bg-muted border border-border-default text-text-muted hover:text-error" title="Delete all">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
        </button>
      </div>

      <Section title="Align to each other">
        <AlignRow relativeTo="selection" />
      </Section>

      <Section title="Align to screen">
        <AlignRow relativeTo="screen" />
      </Section>

      <Section title="Group">
        {allGrouped ? (
          <button onClick={() => ungroupElements(slide.id, ids)} className="w-full h-9 rounded-md bg-muted border border-border-default text-secondary text-xs font-semibold hover:bg-overlay">
            Ungroup
          </button>
        ) : (
          <button onClick={() => { groupElements(slide.id, ids); setSelectedIds(ids); }} className="w-full h-9 rounded-md bg-norte-primary text-white text-xs font-sora font-semibold hover:bg-norte-primary-hover">
            Group {ids.length} items
          </button>
        )}
        <p className="text-[11px] text-text-muted">Grouped items move, resize and select together.</p>
      </Section>

      <Section title="Appearance">
        <Slider label="Opacity" value={Math.round(((first?.opacity ?? 1)) * 100)} min={5} max={100} suffix="%" onChange={(v) => patchAll({ opacity: v / 100 })} />
        <Slider label="Shadow" value={first?.shadow ?? 0} min={0} max={40} suffix="px" onChange={(v) => patchAll({ shadow: v })} />
      </Section>
    </div>
  );
}
