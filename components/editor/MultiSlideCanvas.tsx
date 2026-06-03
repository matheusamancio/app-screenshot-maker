'use client';

import React from 'react';
import { useProjectStore } from '@/store/projectStore';
import SlideCanvas from './SlideCanvas';
import { RECIPE_ROLES } from '@/lib/starterKits';

const SLIDE_WIDTH = 268;

function ToolBtn({ title, onClick, disabled, children }: { title: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className="w-7 h-7 rounded-md flex items-center justify-center text-text-muted hover:text-norte-primary hover:bg-norte-primary-light disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-muted"
    >
      {children}
    </button>
  );
}

export default function MultiSlideCanvas() {
  const slides = useProjectStore((s) => s.slides);
  const activeSlideId = useProjectStore((s) => s.activeSlideId);
  const setActiveSlide = useProjectStore((s) => s.setActiveSlide);
  const activeLanguage = useProjectStore((s) => s.activeLanguage);
  const addSlide = useProjectStore((s) => s.addSlide);
  const duplicateSlide = useProjectStore((s) => s.duplicateSlide);
  const deleteSlide = useProjectStore((s) => s.deleteSlide);
  const reorderSlides = useProjectStore((s) => s.reorderSlides);

  return (
    <div className="flex-1 min-w-0 dot-grid bg-overlay overflow-auto">
      <div className="h-full flex items-center gap-5 px-8 py-6" style={{ minWidth: 'max-content' }}>
        {slides.map((slide, i) => {
          const active = slide.id === activeSlideId;
          const role = slide.role && RECIPE_ROLES.find((r) => r.id === slide.role)?.label;
          return (
            <div key={slide.id} className="flex flex-col items-center gap-2 flex-shrink-0">
              {/* Per-slide toolbar */}
              <div className={`flex items-center gap-0.5 bg-surface border border-border-default rounded-lg px-1 py-0.5 shadow-sm ${active ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}>
                <ToolBtn title="Move left" onClick={() => reorderSlides(i, i - 1)} disabled={i === 0}>
                  <Chevron dir="left" />
                </ToolBtn>
                <ToolBtn title="Duplicate" onClick={() => duplicateSlide(slide.id)}>
                  <CopyIcon />
                </ToolBtn>
                <ToolBtn title="Delete" onClick={() => deleteSlide(slide.id)} disabled={slides.length < 2}>
                  <TrashIcon />
                </ToolBtn>
                <ToolBtn title="Move right" onClick={() => reorderSlides(i, i + 1)} disabled={i === slides.length - 1}>
                  <Chevron dir="right" />
                </ToolBtn>
              </div>

              <SlideCanvas
                slide={slide}
                width={SLIDE_WIDTH}
                active={active}
                onActivate={() => setActiveSlide(slide.id)}
                language={activeLanguage}
              />

              <div className="flex items-center gap-1.5 text-[11px] text-text-muted font-medium">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-semibold ${active ? 'bg-norte-primary text-white' : 'bg-muted text-secondary'}`}>{i + 1}</span>
                {role && <span className="uppercase tracking-wider">{role}</span>}
              </div>
            </div>
          );
        })}

        {/* Add slide */}
        <button
          onClick={addSlide}
          title="Add screen"
          className="flex-shrink-0 rounded-xl border-2 border-dashed border-border-default text-text-muted hover:border-norte-primary hover:text-norte-primary flex items-center justify-center"
          style={{ width: SLIDE_WIDTH * 0.5, height: SLIDE_WIDTH * (2868 / 1320) }}
        >
          <span className="text-3xl">+</span>
        </button>
      </div>
    </div>
  );
}

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ transform: dir === 'right' ? 'rotate(180deg)' : undefined }}>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
