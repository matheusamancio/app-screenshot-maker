'use client';

import React from 'react';
import type { Slide } from '@/types';
import { useProjectStore } from '@/store/projectStore';
import { kindLabel } from '@/lib/elements';
import Accordion from '../../ui/Accordion';
import LayoutPanel from './LayoutPanel';
import BackgroundPanel from './BackgroundPanel';
import TitlePanel from './TitlePanel';
import DevicePanel from './DevicePanel';
import ImageLayerPanel from './ImageLayerPanel';
import FeaturesPanel from './FeaturesPanel';
import HeroPanel from './HeroPanel';

/** Slide / page-level settings — shown when nothing is selected (or via the Slide tab). */
export default function SlidePanel({ slide }: { slide: Slide }) {
  const sections = [
    { id: 'layout', label: 'Layout', icon: <Icon name="layout" />, content: <LayoutPanel slide={slide} /> },
    { id: 'background', label: 'Background', icon: <Icon name="bg" />, content: <BackgroundPanel slide={slide} /> },
    { id: 'title', label: 'Title', icon: <Icon name="text" />, content: <TitlePanel slide={slide} /> },
    { id: 'device', label: 'Device', icon: <Icon name="device" />, content: <DevicePanel slide={slide} /> },
    { id: 'image', label: 'Image Layer', icon: <Icon name="image" />, content: <ImageLayerPanel slide={slide} /> },
    ...(slide.template === 'feature-cards'
      ? [{ id: 'features', label: 'Feature Cards', icon: <Icon name="cards" />, content: <FeaturesPanel slide={slide} /> }]
      : []),
    ...(slide.template === 'habit-hero'
      ? [{ id: 'hero', label: 'Habit Hero', icon: <Icon name="hero" />, content: <HeroPanel slide={slide} /> }]
      : []),
    { id: 'layers', label: 'Layers', icon: <Icon name="layers" />, content: <Layers slide={slide} /> },
  ];
  return <Accordion defaultOpen="layout" sections={sections} />;
}

function Layers({ slide }: { slide: Slide }) {
  const setSelected = useProjectStore((s) => s.setSelectedElement);
  const selected = useProjectStore((s) => s.selectedElementId);
  const reorderElement = useProjectStore((s) => s.reorderElement);
  const selId = selected && selected.startsWith('el:') ? selected.slice(3) : null;
  const elements = slide.elements || [];
  if (!elements.length) return <p className="text-[11px] text-text-muted">No components on this screen yet. Add them from the left rail.</p>;
  // top-most layer first
  const ordered = elements.map((el, i) => ({ el, i })).reverse();
  return (
    <div className="space-y-1">
      {ordered.map(({ el, i }) => (
        <div
          key={el.id}
          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md border ${selId === el.id ? 'border-norte-primary bg-norte-primary-light' : 'border-border-default bg-overlay hover:bg-muted'}`}
        >
          <button onClick={() => setSelected(`el:${el.id}`)} className="flex items-center gap-2 text-left flex-1 min-w-0">
            <span className="text-base w-5 text-center shrink-0">{el.kind === 'emoji' ? el.emoji : el.kind === 'text' ? 'T' : '◫'}</span>
            <span className="text-xs text-secondary truncate flex-1">{el.kind === 'text' ? el.text || 'Text' : kindLabel(el.kind)}</span>
          </button>
          <div className="flex items-center gap-0.5 shrink-0">
            <button title="Bring forward" onClick={() => reorderElement(slide.id, el.id, 'forward')} disabled={i === elements.length - 1} className="w-5 h-5 rounded text-text-muted hover:text-norte-primary disabled:opacity-25">↑</button>
            <button title="Send backward" onClick={() => reorderElement(slide.id, el.id, 'backward')} disabled={i === 0} className="w-5 h-5 rounded text-text-muted hover:text-norte-primary disabled:opacity-25">↓</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function Icon({ name }: { name: string }) {
  const props = { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (name) {
    case 'layout':
      return (<svg {...props}><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>);
    case 'bg':
      return (<svg {...props}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8" cy="9" r="1" /></svg>);
    case 'text':
      return (<svg {...props}><polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" /></svg>);
    case 'device':
      return (<svg {...props}><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12" y2="18" /></svg>);
    case 'cards':
      return (<svg {...props}><rect x="3" y="4" width="18" height="6" rx="1.5" /><rect x="3" y="14" width="18" height="6" rx="1.5" /></svg>);
    case 'hero':
      return (<svg {...props}><rect x="7" y="8" width="10" height="13" rx="2" /><circle cx="6" cy="5" r="1.6" /><circle cx="18" cy="6" r="1.6" /><circle cx="12" cy="3.5" r="1.6" /></svg>);
    case 'layers':
      return (<svg {...props}><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>);
    case 'image':
      return (<svg {...props}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="M21 15l-5-5L5 21" /></svg>);
    default:
      return null;
  }
}
