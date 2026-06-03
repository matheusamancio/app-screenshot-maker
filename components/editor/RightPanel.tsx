'use client';

import React from 'react';
import type { Slide } from '@/types';
import Accordion from '../ui/Accordion';
import LayoutPanel from './panels/LayoutPanel';
import BackgroundPanel from './panels/BackgroundPanel';
import TitlePanel from './panels/TitlePanel';
import DevicePanel from './panels/DevicePanel';
import ImageLayerPanel from './panels/ImageLayerPanel';
import FeaturesPanel from './panels/FeaturesPanel';

interface Props {
  slide: Slide;
}

export default function RightPanel({ slide }: Props) {
  return (
    <aside className="w-80 border-l border-border-default bg-surface flex flex-col">
      <div className="px-4 pt-4 pb-3 border-b border-border-default flex items-center justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-text-muted font-medium">Slide settings</div>
          <div className="text-sm font-semibold text-primary font-sora">Customize</div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-3">
        <Accordion
          defaultOpen="layout"
          sections={[
            { id: 'layout', label: 'Layout', icon: <Icon name="layout" />, content: <LayoutPanel slide={slide} /> },
            { id: 'background', label: 'Background', icon: <Icon name="bg" />, content: <BackgroundPanel slide={slide} /> },
            { id: 'title', label: 'Title', icon: <Icon name="text" />, content: <TitlePanel slide={slide} /> },
            { id: 'features', label: 'Feature Cards', icon: <Icon name="cards" />, content: <FeaturesPanel slide={slide} /> },
            { id: 'device', label: 'Device', icon: <Icon name="device" />, content: <DevicePanel slide={slide} /> },
            { id: 'image', label: 'Image Layer', icon: <Icon name="image" />, content: <ImageLayerPanel slide={slide} /> },
          ]}
        />
      </div>
    </aside>
  );
}

function Icon({ name }: { name: string }) {
  const props = { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (name) {
    case 'layout':
      return (
        <svg {...props}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
      );
    case 'bg':
      return (
        <svg {...props}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8" cy="9" r="1" />
        </svg>
      );
    case 'text':
      return (
        <svg {...props}>
          <polyline points="4 7 4 4 20 4 20 7" />
          <line x1="9" y1="20" x2="15" y2="20" />
          <line x1="12" y1="4" x2="12" y2="20" />
        </svg>
      );
    case 'device':
      return (
        <svg {...props}>
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <line x1="12" y1="18" x2="12" y2="18" />
        </svg>
      );
    case 'cards':
      return (
        <svg {...props}>
          <rect x="3" y="4" width="18" height="6" rx="1.5" />
          <rect x="3" y="14" width="18" height="6" rx="1.5" />
        </svg>
      );
    case 'image':
      return (
        <svg {...props}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      );
    default:
      return null;
  }
}
