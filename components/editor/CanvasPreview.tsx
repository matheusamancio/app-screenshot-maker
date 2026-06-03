'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { getDevice } from '@/lib/deviceSizes';
import TemplateRenderer from '../templates/TemplateRenderer';
import TransformController from './TransformController';
import type { Slide, Language, ElementTransform } from '@/types';
import { BASE_LANGUAGE } from '@/types';
import { IDENTITY_TRANSFORM } from '@/types';

interface Props {
  slide: Slide;
  language?: Language;
}

type ZoomMode = 'fit' | '50' | '100';

export default function CanvasPreview({ slide, language = BASE_LANGUAGE }: Props) {
  const previewDeviceId = useProjectStore((s) => s.previewDeviceId);
  const updateSlide = useProjectStore((s) => s.updateSlide);
  const updateLocalization = useProjectStore((s) => s.updateLocalization);
  const updateElementTransform = useProjectStore((s) => s.updateElementTransform);
  const resetElementTransform = useProjectStore((s) => s.resetElementTransform);
  const updateElement = useProjectStore((s) => s.updateElement);
  const deleteElement = useProjectStore((s) => s.deleteElement);
  const copyElement = useProjectStore((s) => s.copyElement);
  const pasteElement = useProjectStore((s) => s.pasteElement);
  const clipboardElement = useProjectStore((s) => s.clipboardElement);
  const selected = useProjectStore((s) => s.selectedElementId);
  const setSelected = useProjectStore((s) => s.setSelectedElement);

  const device = getDevice(previewDeviceId);
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<ZoomMode>('fit');
  const [computedScale, setComputedScale] = useState(0.3);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [measureTick, setMeasureTick] = useState(0);

  const targetW = device?.width || 1320;
  const targetH = device?.height || 2868;
  const BASE_W = 390;
  const scaleFactor = targetW / BASE_W;

  const elId = selected && selected.startsWith('el:') ? selected.slice(3) : null;
  const selectedEl = elId ? slide.elements?.find((e) => e.id === elId) : undefined;

  const recalc = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const padding = 64;
    const availW = Math.max(120, rect.width - padding);
    const availH = Math.max(120, rect.height - padding);
    if (zoom === 'fit') {
      const s = Math.min(availW / targetW, availH / targetH);
      setComputedScale(Math.min(0.5, Math.max(0.05, s)));
    } else if (zoom === '50') {
      setComputedScale(0.5);
    } else {
      setComputedScale(1);
    }
  }, [zoom, targetW, targetH]);

  useEffect(() => {
    recalc();
    const obs = new ResizeObserver(() => {
      recalc();
      setMeasureTick((t) => t + 1);
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [recalc]);

  // Reset selection/editing when active slide changes.
  useEffect(() => {
    setSelected(null);
    setEditingElementId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slide.id]);

  // Bump measure tick whenever the underlying DOM changes.
  useEffect(() => {
    setMeasureTick((t) => t + 1);
  }, [slide.titleTransform, slide.deviceTransform, slide.template, slide.title.fontSize, slide.title.text, slide.title.subtitle, slide.device.scale, slide.elements, selected, computedScale]);

  // Keyboard: copy / paste / delete the selected element.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ae = document.activeElement as HTMLElement | null;
      const typing = !!ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.isContentEditable);
      const meta = e.metaKey || e.ctrlKey;
      if (editingElementId) return;
      if (meta && (e.key === 'c' || e.key === 'C')) {
        if (elId && !typing) {
          copyElement(slide.id, elId);
        }
      } else if (meta && (e.key === 'v' || e.key === 'V')) {
        if (clipboardElement && !typing) {
          e.preventDefault();
          pasteElement(slide.id);
        }
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && elId && !typing) {
        e.preventDefault();
        deleteElement(slide.id, elId);
      } else if (e.key === 'Escape') {
        setSelected(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [elId, clipboardElement, editingElementId, slide.id, copyElement, pasteElement, deleteElement, setSelected]);

  const currentTransform: ElementTransform = selectedEl
    ? { x: selectedEl.x, y: selectedEl.y, rotation: selectedEl.rotation, scale: selectedEl.scale }
    : selected === 'title'
    ? slide.titleTransform || IDENTITY_TRANSFORM
    : selected === 'device'
    ? slide.deviceTransform || IDENTITY_TRANSFORM
    : IDENTITY_TRANSFORM;

  return (
    <div className="relative h-full w-full dot-grid bg-overlay">
      <div ref={containerRef} className="absolute inset-0 overflow-auto flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <div
            ref={canvasWrapperRef}
            className="rounded-xl bg-surface shadow-canvas relative"
            style={{
              width: targetW * computedScale,
              height: targetH * computedScale,
              flexShrink: 0,
              overflow: 'visible',
            }}
            onPointerDown={(e) => {
              const target = e.target as HTMLElement;
              if (!target.closest('[data-element]') && !target.closest('[data-overlay]')) {
                setSelected(null);
                setEditingElementId(null);
              }
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                borderRadius: 'inherit',
              }}
            >
              <div
                ref={stageRef}
                style={{
                  width: targetW,
                  height: targetH,
                  transformOrigin: 'top left',
                  transform: `scale(${computedScale})`,
                }}
              >
                <TemplateRenderer
                  slide={slide}
                  width={targetW}
                  height={targetH}
                  language={language}
                  editingElementId={editingElementId}
                  onElementSelect={(sel) => {
                    setEditingElementId(null);
                    setSelected(sel);
                  }}
                  onElementTextChange={(id, text) => {
                    const el = slide.elements?.find((x) => x.id === id);
                    if (!el) return;
                    updateElement(slide.id, id, el.kind === 'emoji' ? { emoji: text } : { text });
                  }}
                  onElementEditStart={(id) => {
                    setSelected(null);
                    setEditingElementId(id);
                  }}
                  onElementEditEnd={() => setEditingElementId(null)}
                  onTitleChange={(value) => {
                    if (language !== BASE_LANGUAGE) {
                      updateLocalization(slide.id, language, {
                        title: value,
                        subtitle: slide.localizations?.[language]?.subtitle || '',
                      });
                    } else {
                      updateSlide(slide.id, { title: { ...slide.title, text: value } });
                    }
                  }}
                  onSubtitleChange={(value) => {
                    if (language !== BASE_LANGUAGE) {
                      updateLocalization(slide.id, language, {
                        title: slide.localizations?.[language]?.title || '',
                        subtitle: value,
                      });
                    } else {
                      updateSlide(slide.id, { title: { ...slide.title, subtitle: value } });
                    }
                  }}
                  onElementPointerDown={(element, e) => {
                    const target = e.target as HTMLElement;
                    if (target.isContentEditable && document.activeElement === target) return;
                    e.preventDefault();
                    setEditingElementId(null);
                    setSelected(element);
                  }}
                />
              </div>
            </div>
            {/* Transform overlay — sits in screen-space over the canvas wrapper. */}
            <div data-overlay style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              <TransformController
                canvasWrapperRef={canvasWrapperRef}
                stageRef={stageRef}
                scaleFactor={scaleFactor}
                computedScale={computedScale}
                selected={editingElementId ? null : selected}
                label={selectedEl ? (selectedEl.kind === 'emoji' ? 'Sticker' : 'Text') : selected || ''}
                isElement={!!selectedEl}
                transform={currentTransform}
                measureTick={measureTick}
                onChange={(patch) => {
                  if (!selected) return;
                  if (elId) updateElement(slide.id, elId, patch);
                  else if (selected === 'title' || selected === 'device') updateElementTransform(slide.id, selected, patch);
                }}
                onReset={() => {
                  if (elId) updateElement(slide.id, elId, { rotation: 0, scale: 1 });
                  else if (selected === 'title' || selected === 'device') resetElementTransform(slide.id, selected);
                }}
                onCopy={elId ? () => copyElement(slide.id, elId) : undefined}
                onDelete={elId ? () => deleteElement(slide.id, elId) : undefined}
                onEditRequest={
                  selectedEl
                    ? () => {
                        setEditingElementId(selectedEl.id);
                        setSelected(null);
                      }
                    : selected === 'title'
                    ? () => {
                        // Focus the built-in title's inline editor (double-click to edit).
                        setSelected(null);
                        setTimeout(() => {
                          const ce = canvasWrapperRef.current?.querySelector(
                            '[data-element="title"] [contenteditable="true"]',
                          ) as HTMLElement | null;
                          if (!ce) return;
                          ce.focus();
                          const range = document.createRange();
                          range.selectNodeContents(ce);
                          range.collapse(false);
                          const sel = window.getSelection();
                          sel?.removeAllRanges();
                          sel?.addRange(range);
                        }, 0);
                      }
                    : undefined
                }
              />
            </div>
          </div>
          <div className="text-xs text-text-muted font-medium flex items-center gap-2">
            <span>{device?.label || 'Device'} · {targetW} × {targetH}</span>
            <span className="text-text-muted">·</span>
            <span className="text-norte-primary font-medium">Click to select · drag to move · double-click text to edit · ⌘C / ⌘V to copy across slides</span>
          </div>
        </div>
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-surface border border-border-default rounded-md shadow-sm p-1">
        {(['fit', '50', '100'] as ZoomMode[]).map((z) => (
          <button
            key={z}
            onClick={() => setZoom(z)}
            className={`px-2.5 py-1 text-xs font-medium rounded ${
              zoom === z ? 'bg-norte-primary-light text-norte-primary' : 'text-text-muted hover:text-secondary'
            }`}
          >
            {z === 'fit' ? 'Fit' : z === '50' ? '50%' : '100%'}
          </button>
        ))}
      </div>
    </div>
  );
}
