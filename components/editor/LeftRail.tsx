'use client';

import React, { useRef, useState } from 'react';
import { useProjectStore } from '@/store/projectStore';
import {
  newTextElement,
  newEmojiElement,
  newShape,
  newHeatmap,
  newIconEl,
  newStarsEl,
  newLaurelEl,
  newDateStrip,
  newStreakWidget,
  newStatCard,
  newNotification,
} from '@/lib/elements';
import type { SlideElement } from '@/types';
import { fileToBase64 } from '@/lib/utils';
import BackgroundPanel from './panels/BackgroundPanel';
import { useToast } from '../ui/Toast';
import type { Slide } from '@/types';

type Tab = 'templates' | 'elements' | 'text' | 'background' | 'uploads';

const STICKERS = ['🏋️', '📚', '🧘', '🏃', '☀️', '💧', '🍌', '🔥', '⭐', '✅', '🎯', '💊', '🧠', '🥗', '😴', '☕', '🚭', '💪', '📈', '🏆', '🌙', '🍎', '🚀', '❤️'];

export default function LeftRail({ onOpenTemplates }: { onOpenTemplates: () => void }) {
  const [tab, setTab] = useState<Tab | null>(null);
  const slides = useProjectStore((s) => s.slides);
  const activeSlideId = useProjectStore((s) => s.activeSlideId);
  const addElement = useProjectStore((s) => s.addElement);
  const updateSlide = useProjectStore((s) => s.updateSlide);
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const activeSlide: Slide = slides.find((s) => s.id === activeSlideId) || slides[0];

  const select = (t: Tab) => {
    if (t === 'templates') {
      onOpenTemplates();
      return;
    }
    setTab((cur) => (cur === t ? null : t));
  };

  const addText = (preset: 'heading' | 'sub' | 'body') => {
    const el = newTextElement();
    if (preset === 'heading') Object.assign(el, { text: 'Heading', fontSize: 44, fontWeight: 800 });
    if (preset === 'sub') Object.assign(el, { text: 'Subheading', fontSize: 26, fontWeight: 600 });
    if (preset === 'body') Object.assign(el, { text: 'Body text', fontSize: 18, fontWeight: 400 });
    addElement(activeSlideId, el);
    toast('Text added to this screen', 'success');
  };

  const addSticker = (emoji: string) => {
    addElement(activeSlideId, newEmojiElement(195, 300, emoji));
  };

  const add = (el: SlideElement) => {
    addElement(activeSlideId, el);
    toast('Added to this screen', 'success');
  };

  const COMPONENTS: { label: string; make: () => SlideElement }[] = [
    { label: 'Heatmap', make: () => newHeatmap() },
    { label: 'Streak widget', make: () => newStreakWidget() },
    { label: 'Notification', make: () => newNotification() },
    { label: 'Stat card', make: () => newStatCard() },
    { label: 'Date strip', make: () => newDateStrip() },
    { label: 'Rounded box', make: () => newShape() },
    { label: 'Stars', make: () => newStarsEl() },
    { label: 'Laurel rating', make: () => newLaurelEl() },
  ];
  const ICONS = ['check', 'fire', 'lock', 'bell', 'mountain', 'plus', 'play'];

  const onUpload = async (file: File | undefined) => {
    if (!file) return;
    const b64 = await fileToBase64(file);
    updateSlide(activeSlideId, { screenshot: b64 });
    toast('Image set as this screen’s device shot', 'success');
  };

  const RAIL: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'templates', label: 'Templates', icon: <IconTemplates /> },
    { id: 'elements', label: 'Elements', icon: <IconElements /> },
    { id: 'text', label: 'Text', icon: <IconText /> },
    { id: 'background', label: 'Background', icon: <IconBg /> },
    { id: 'uploads', label: 'Uploads', icon: <IconUpload /> },
  ];

  return (
    <div className="flex h-full">
      {/* Icon rail */}
      <div className="w-[68px] bg-surface border-r border-border-default flex flex-col items-center py-3 gap-1 shrink-0">
        {RAIL.map((r) => (
          <button
            key={r.id}
            onClick={() => select(r.id)}
            className={`w-14 h-14 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
              tab === r.id ? 'bg-norte-primary-light text-norte-primary' : 'text-text-muted hover:bg-overlay hover:text-secondary'
            }`}
          >
            {r.icon}
            <span className="text-[9px] font-semibold">{r.label}</span>
          </button>
        ))}
      </div>

      {/* Content panel */}
      {tab && tab !== 'templates' && (
        <div className="w-[260px] bg-surface border-r border-border-default flex flex-col shrink-0">
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <div className="font-sora font-semibold text-sm text-primary capitalize">{tab}</div>
            <button onClick={() => setTab(null)} className="text-text-muted hover:text-secondary text-lg leading-none">×</button>
          </div>
          <div className="flex-1 overflow-y-auto px-3 pb-4">
            {tab === 'text' && (
              <div className="space-y-2">
                <button onClick={() => addText('heading')} className="w-full text-left px-3 py-3 rounded-md bg-overlay hover:bg-muted border border-border-default text-primary font-extrabold text-2xl">Add a heading</button>
                <button onClick={() => addText('sub')} className="w-full text-left px-3 py-2.5 rounded-md bg-overlay hover:bg-muted border border-border-default text-secondary font-semibold text-lg">Add a subheading</button>
                <button onClick={() => addText('body')} className="w-full text-left px-3 py-2 rounded-md bg-overlay hover:bg-muted border border-border-default text-secondary text-sm">Add body text</button>
                <p className="text-[11px] text-text-muted leading-relaxed pt-1">Text is added as a movable component — drag it, double-click to edit, ⌘C/⌘V to copy across screens.</p>
              </div>
            )}
            {tab === 'elements' && (
              <div className="space-y-4">
                <div>
                  <div className="section-label mb-2">Norte components</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {COMPONENTS.map((c) => (
                      <button key={c.label} onClick={() => add(c.make())} className="px-2 py-2.5 rounded-md bg-overlay hover:bg-muted border border-border-default text-xs font-medium text-secondary text-left">
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="section-label mb-2">Icons</div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {ICONS.map((ic) => (
                      <button key={ic} onClick={() => add(newIconEl(195, 400, ic))} title={ic} className="aspect-square rounded-md bg-overlay hover:bg-muted border border-border-default flex items-center justify-center text-text-muted">
                        <NorteIconPreview name={ic} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="section-label mb-2">Stickers</div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {STICKERS.map((e) => (
                      <button key={e} onClick={() => addSticker(e)} className="aspect-square rounded-md bg-overlay hover:bg-muted border border-border-default flex items-center justify-center text-xl">
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed">Every component is movable and editable — drag on the canvas, tweak it in the right panel, reuse it on any screen with ⌘C/⌘V.</p>
              </div>
            )}
            {tab === 'background' && <BackgroundPanel slide={activeSlide} />}
            {tab === 'uploads' && (
              <div className="space-y-3">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full h-24 rounded-lg border-2 border-dashed border-border-default text-text-muted hover:border-norte-primary hover:text-norte-primary flex flex-col items-center justify-center gap-1"
                >
                  <span className="text-2xl">⤒</span>
                  <span className="text-xs font-medium">Upload an image</span>
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    onUpload(e.target.files?.[0]);
                    e.target.value = '';
                  }}
                />
                <p className="text-[11px] text-text-muted leading-relaxed">Uploads fill the active screen’s device. You can also drag an image straight onto a screen.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const svg = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
function IconTemplates() { return (<svg {...svg}><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></svg>); }
function IconElements() { return (<svg {...svg}><rect x="3" y="3" width="7" height="7" rx="1.5" /><circle cx="17.5" cy="6.5" r="3.5" /><path d="M6.5 14 3 21h7z" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>); }
function IconText() { return (<svg {...svg}><polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" /></svg>); }
function IconBg() { return (<svg {...svg}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>); }
function IconUpload() { return (<svg {...svg}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>); }

function NorteIconPreview({ name }: { name: string }) {
  const p = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (name) {
    case 'check': return (<svg {...p}><polyline points="20 6 9 17 4 12" /></svg>);
    case 'fire': return (<svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C9 6 7 8 7 12a5 5 0 0 0 10 0c0-1.5-.5-3-1.5-4 0 1.5-1 2-2 2 .5-2-.5-5-1.5-6z" /></svg>);
    case 'lock': return (<svg {...p}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>);
    case 'bell': return (<svg {...p}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>);
    case 'mountain': return (<svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor"><path d="M3 20 9 8l3 5 2-3 4 10z" /><circle cx="14" cy="3.5" r="1.4" /></svg>);
    case 'plus': return (<svg {...p}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>);
    case 'play': return (<svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>);
    default: return (<svg {...p}><circle cx="12" cy="12" r="9" /></svg>);
  }
}
