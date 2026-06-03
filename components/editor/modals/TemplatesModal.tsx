'use client';

import React, { useState } from 'react';
import Modal from '../../ui/Modal';
import { STARTER_KITS, StarterKit, RECIPE_ROLES } from '@/lib/starterKits';
import { useProjectStore } from '@/store/projectStore';
import TemplateRenderer from '../../templates/TemplateRenderer';
import { useToast } from '../../ui/Toast';
import type { Slide } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
}

function kitToSlide(kit: StarterKit, idx: number): Slide {
  const ks = kit.slides[idx % kit.slides.length];
  const full = ks.fullImage;
  const hideTitle = !!full || !!ks.noTitle || !!ks.noChrome;
  const hideDevice = !!full || !!ks.noChrome;
  return {
    id: `${kit.id}-${idx}`,
    screenshot: null,
    template: ks.template,
    background: full ? { type: 'image', imageBase64: full } : kit.background,
    title: {
      text: ks.title,
      subtitle: ks.subtitle || '',
      showSubtitle: !!ks.showSubtitle,
      fontFamily: kit.title.fontFamily,
      fontSize: kit.title.fontSize,
      fontWeight: kit.title.fontWeight,
      color: kit.title.color,
      subtitleColor: kit.title.subtitleColor,
      subtitleFontSize: kit.title.subtitleFontSize,
      alignment: kit.title.alignment,
      position: 'top',
      floatingPosition: 'top',
      layer: { visible: !hideTitle, opacity: 1, locked: false },
    },
    device: {
      frameType: kit.device.frameType,
      frameStyle: kit.device.frameStyle,
      orientation: 'portrait',
      scale: kit.device.scale,
      verticalPosition: 'center',
      layer: { visible: !full, opacity: 1, locked: false },
    },
    overlayImage: { imageBase64: null, fit: 'contain', opacity: 1, verticalPosition: 'center', layer: { visible: true, opacity: 1, locked: false } },
    localizations: {},
    featureCards: ks.featureCards ? ks.featureCards.map((c, i) => ({ id: `${kit.id}-${idx}-card-${i}`, title: c.title, body: c.body })) : undefined,
    featureMore: ks.featureMore,
    elements: ks.elements ? ks.elements.map((e, i) => ({ ...e, id: `${kit.id}-${idx}-el-${i}` })) : undefined,
    linkedToGlobals: true,
  };
}

function MiniSlide({ kit, idx }: { kit: StarterKit; idx: number }) {
  const w = 80;
  const h = 145;
  const innerW = 390;
  const innerH = 844;
  const scale = w / innerW;
  const slide = kitToSlide(kit, idx);
  const role = kit.slides[idx]?.role;
  const roleLabel = role && RECIPE_ROLES.find((r) => r.id === role)?.label;
  return (
    <div className="flex flex-col items-center gap-1 flex-shrink-0">
      <div className="relative overflow-hidden rounded-md" style={{ width: w, height: h }}>
        <div style={{ width: innerW, height: innerH, transform: `scale(${scale})`, transformOrigin: 'top left', pointerEvents: 'none' }}>
          <TemplateRenderer slide={slide} width={innerW} height={innerH} />
        </div>
      </div>
      {roleLabel && (
        <div className="text-[9px] text-text-muted font-semibold uppercase tracking-wider">{roleLabel}</div>
      )}
    </div>
  );
}

function KitCard({ kit, onApply, onPreview }: { kit: StarterKit; onApply: () => void; onPreview: () => void }) {
  return (
    <div className="bg-overlay border border-border-default rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="font-sora font-semibold text-primary text-sm truncate">{kit.name}</div>
            <span className="text-[9px] font-semibold uppercase tracking-wider bg-success-light text-success px-1.5 py-0.5 rounded">
              {kit.slides.length} slides
            </span>
          </div>
          <div className="text-[11px] text-text-muted truncate">{kit.tagline}</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-3 h-3 rounded-full" style={{ background: kit.swatch }} />
          <button
            onClick={onPreview}
            className="text-xs font-medium text-norte-primary hover:underline"
          >
            Preview
          </button>
          <button
            onClick={onApply}
            className="h-7 px-2.5 rounded-md bg-norte-primary text-white text-xs font-sora font-semibold hover:bg-norte-primary-hover"
          >
            Use template
          </button>
        </div>
      </div>
      <div className="px-3 pb-3 pt-1">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {kit.slides.map((_, i) => (
            <MiniSlide key={i} kit={kit} idx={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PreviewPanel({ kit, onClose, onApply }: { kit: StarterKit; onClose: () => void; onApply: () => void }) {
  return (
    <div className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm fade-in" onMouseDown={onClose}>
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-5xl max-h-[88vh] bg-surface rounded-lg shadow-canvas border border-border-default flex flex-col"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-default">
          <div className="flex items-center gap-3">
            <span className="w-5 h-5 rounded-md shadow-sm" style={{ background: kit.swatch }} />
            <div>
              <div className="font-sora font-semibold text-lg text-primary">{kit.name}</div>
              <div className="text-xs text-text-muted">{kit.tagline}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="h-9 px-3 rounded-md bg-muted border border-border-default text-secondary text-sm font-medium hover:bg-overlay"
            >
              Close
            </button>
            <button
              onClick={onApply}
              className="h-9 px-4 rounded-md bg-norte-primary text-white text-sm font-sora font-semibold hover:bg-norte-primary-hover"
            >
              Use this template →
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-5 bg-overlay">
          <div className="flex gap-4 justify-center flex-wrap">
            {kit.slides.map((_, i) => {
              const slide = kitToSlide(kit, i);
              const w = 220;
              const h = 470;
              const innerW = 390;
              const innerH = 844;
              const scale = w / innerW;
              return (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="rounded-md overflow-hidden bg-surface shadow-md" style={{ width: w, height: h }}>
                    <div style={{ width: innerW, height: innerH, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
                      <TemplateRenderer slide={slide} width={innerW} height={innerH} />
                    </div>
                  </div>
                  <div className="text-[11px] text-text-muted font-medium">Slide {i + 1}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TemplatesModal({ open, onClose }: Props) {
  const applyStarterKit = useProjectStore((s) => s.applyStarterKit);
  const slides = useProjectStore((s) => s.slides);
  const { toast } = useToast();
  const [previewKit, setPreviewKit] = useState<StarterKit | null>(null);
  const [keepScreens, setKeepScreens] = useState(true);

  const apply = (kit: StarterKit) => {
    const hasContent = slides.some((s) => s.screenshot || s.title.text !== 'Build something\nbeautiful.');
    if (hasContent) {
      const ok = window.confirm(
        `Replace your ${slides.length} slide${slides.length !== 1 ? 's' : ''} with the "${kit.name}" template?\n\n${
          keepScreens ? 'Your screenshots will be kept and reused.' : 'Screenshots will be cleared.'
        }`,
      );
      if (!ok) return;
    }
    applyStarterKit(kit.id, { keepScreenshots: keepScreens });
    toast(`Applied "${kit.name}" — drop your screenshots to finish`, 'success');
    setPreviewKit(null);
    onClose();
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Browse templates"
        description="Pick a ready-made style. Drop your screenshots and edit your text — done."
        size="lg"
      >
        <div className="mb-4 bg-norte-primary-light border border-norte-primary/30 rounded-md px-4 py-3 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-norte-primary">
              <span className="font-sora font-semibold">The 5–6 slide standard</span> · Used by Uber, Airbnb, Spotify, and most top apps. Apple shows only the first 3 in search.
            </div>
            <label className="text-xs text-secondary flex items-center gap-2 cursor-pointer whitespace-nowrap">
              <input
                type="checkbox"
                checked={keepScreens}
                onChange={(e) => setKeepScreens(e.target.checked)}
                className="accent-[var(--norte-primary)]"
              />
              Keep current screenshots
            </label>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {RECIPE_ROLES.map((r, i) => (
              <span
                key={r.id}
                className="text-[10px] font-semibold uppercase tracking-wider bg-surface text-secondary border border-border-default px-1.5 py-0.5 rounded"
                title={r.hint}
              >
                {i + 1}. {r.label}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {STARTER_KITS.map((kit) => (
            <KitCard
              key={kit.id}
              kit={kit}
              onApply={() => apply(kit)}
              onPreview={() => setPreviewKit(kit)}
            />
          ))}
        </div>
      </Modal>
      {previewKit && (
        <PreviewPanel kit={previewKit} onClose={() => setPreviewKit(null)} onApply={() => apply(previewKit)} />
      )}
    </>
  );
}
