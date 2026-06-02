'use client';

import React, { useState } from 'react';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useProjectStore } from '@/store/projectStore';
import TemplateRenderer from '../templates/TemplateRenderer';
import type { Slide, SlideRole } from '@/types';

const ROLE_LABELS: Record<SlideRole, string> = {
  hero: 'Hero',
  'use-case': 'Use case',
  differentiator: 'Diff',
  secondary: 'Feature',
  proof: 'Proof',
  cta: 'CTA',
};

interface ThumbProps {
  slide: Slide;
  index: number;
  active: boolean;
  onSelect: () => void;
  onContext: (e: React.MouseEvent) => void;
}

function SlideThumb({ slide, index, active, onSelect, onContext }: ThumbProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: slide.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };
  const thumbW = 56;
  const thumbH = 100;
  const innerW = 390;
  const innerH = 844;
  const scale = thumbW / innerW;

  return (
    <div ref={setNodeRef} style={style} className="relative flex flex-col items-center">
      <button
        {...attributes}
        {...listeners}
        onClick={onSelect}
        onContextMenu={onContext}
        className={`relative overflow-hidden rounded-md transition-all ${
          active ? 'ring-2 ring-norte-primary shadow-md' : 'ring-1 ring-border-default hover:ring-border-strong'
        }`}
        style={{ width: thumbW, height: thumbH, background: 'white', cursor: 'pointer', flexShrink: 0 }}
        title={`Slide ${index + 1}`}
      >
        <div style={{ width: innerW, height: innerH, transform: `scale(${scale})`, transformOrigin: 'top left', pointerEvents: 'none' }}>
          <TemplateRenderer slide={slide} width={innerW} height={innerH} />
        </div>
        <div
          className="absolute top-1 left-1 w-4 h-4 rounded-full bg-surface text-primary text-[9px] font-semibold flex items-center justify-center shadow-sm"
        >
          {index + 1}
        </div>
        {slide.role && (
          <div
            className="absolute bottom-1 left-1 right-1 text-[8px] font-semibold uppercase tracking-wider text-white text-center bg-black/55 rounded-sm py-0.5 backdrop-blur-sm"
            title={`Recipe role: ${ROLE_LABELS[slide.role]}`}
          >
            {ROLE_LABELS[slide.role]}
          </div>
        )}
      </button>
    </div>
  );
}

function SlideCountBadge({ count }: { count: number }) {
  let tone: { bg: string; fg: string; ring: string; label: string };
  if (count >= 5 && count <= 6) {
    tone = { bg: 'bg-success-light', fg: 'text-success', ring: 'ring-success/30', label: 'Standard' };
  } else if (count >= 2 && count <= 8) {
    tone = { bg: 'bg-norte-secondary-light', fg: 'text-norte-secondary', ring: 'ring-norte-secondary/30', label: count < 5 ? 'Add more' : 'Trim down' };
  } else {
    tone = { bg: 'bg-error/10', fg: 'text-error', ring: 'ring-error/30', label: count < 2 ? 'Min 2' : 'Max 8' };
  }
  return (
    <div
      className={`mb-1 text-[9px] font-semibold ${tone.bg} ${tone.fg} ring-1 ${tone.ring} rounded px-1.5 py-1 text-center w-14 leading-tight`}
      title={`5–6 is the App Store standard.\nPlay Store min 2 / max 8.`}
    >
      <div className="text-[12px] leading-none font-sora">{count}</div>
      <div className="mt-0.5 uppercase tracking-wide">{tone.label}</div>
    </div>
  );
}

export default function SlideStrip() {
  const slides = useProjectStore((s) => s.slides);
  const activeSlideId = useProjectStore((s) => s.activeSlideId);
  const setActiveSlide = useProjectStore((s) => s.setActiveSlide);
  const addSlide = useProjectStore((s) => s.addSlide);
  const reorderSlides = useProjectStore((s) => s.reorderSlides);
  const duplicateSlide = useProjectStore((s) => s.duplicateSlide);
  const deleteSlide = useProjectStore((s) => s.deleteSlide);
  const copySlideSettings = useProjectStore((s) => s.copySlideSettings);

  const [menu, setMenu] = useState<{ x: number; y: number; slideId: string } | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = slides.findIndex((s) => s.id === active.id);
    const newIdx = slides.findIndex((s) => s.id === over.id);
    if (oldIdx >= 0 && newIdx >= 0) reorderSlides(oldIdx, newIdx);
  };

  return (
    <div className="w-20 bg-muted border-r border-border-default flex flex-col items-center py-3 gap-2 overflow-y-auto" onClick={() => setMenu(null)}>
      <div className="section-label !text-[9px]">Slides</div>
      <SlideCountBadge count={slides.length} />
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={slides.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2 items-center">
            {slides.map((s, i) => (
              <SlideThumb
                key={s.id}
                slide={s}
                index={i}
                active={s.id === activeSlideId}
                onSelect={() => setActiveSlide(s.id)}
                onContext={(e) => {
                  e.preventDefault();
                  setMenu({ x: e.clientX, y: e.clientY, slideId: s.id });
                }}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button
        onClick={addSlide}
        className="w-14 h-14 mt-2 rounded-md border-2 border-dashed border-border-strong text-text-muted hover:border-norte-primary hover:text-norte-primary flex items-center justify-center text-xl transition-all"
        title="Add slide"
      >
        +
      </button>

      {menu && (
        <div
          className="fixed z-50 bg-surface border border-border-default rounded-md shadow-lg py-1 min-w-[160px] fade-in"
          style={{ left: menu.x, top: menu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full text-left px-3 py-1.5 text-sm hover:bg-overlay text-secondary"
            onClick={() => {
              duplicateSlide(menu.slideId);
              setMenu(null);
            }}
          >
            Duplicate
          </button>
          <button
            className="w-full text-left px-3 py-1.5 text-sm hover:bg-overlay text-secondary"
            onClick={() => {
              copySlideSettings(menu.slideId, 'all');
              setMenu(null);
            }}
          >
            Copy settings → all
          </button>
          <div className="my-1 border-t border-border-default" />
          <button
            className="w-full text-left px-3 py-1.5 text-sm hover:bg-overlay text-error"
            onClick={() => {
              deleteSlide(menu.slideId);
              setMenu(null);
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
