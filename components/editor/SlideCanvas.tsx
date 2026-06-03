'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { getDevice } from '@/lib/deviceSizes';
import TemplateRenderer from '../templates/TemplateRenderer';
import TransformController from './TransformController';
import type { Slide, Language, ElementTransform } from '@/types';
import { BASE_LANGUAGE, IDENTITY_TRANSFORM } from '@/types';

interface Props {
  slide: Slide;
  /** Rendered width in px. */
  width: number;
  /** Whether this slide is the active/selected one (shows transform chrome + handles keys). */
  active: boolean;
  onActivate: () => void;
  language?: Language;
}

/**
 * A fixed-size, editable single-slide canvas. Used in the side-by-side
 * multi-slide view. Selection lives in the store (global); only the active
 * slide shows the transform overlay and owns keyboard shortcuts.
 */
export default function SlideCanvas({ slide, width, active, onActivate, language = BASE_LANGUAGE }: Props) {
  const previewDeviceId = useProjectStore((s) => s.previewDeviceId);
  const updateSlide = useProjectStore((s) => s.updateSlide);
  const updateLocalization = useProjectStore((s) => s.updateLocalization);
  const updateElementTransform = useProjectStore((s) => s.updateElementTransform);
  const resetElementTransform = useProjectStore((s) => s.resetElementTransform);
  const updateElement = useProjectStore((s) => s.updateElement);
  const setElementLocalizedText = useProjectStore((s) => s.setElementLocalizedText);
  const deleteElement = useProjectStore((s) => s.deleteElement);
  const copyElement = useProjectStore((s) => s.copyElement);
  const pasteElement = useProjectStore((s) => s.pasteElement);
  const clipboardElement = useProjectStore((s) => s.clipboardElement);
  const selected = useProjectStore((s) => s.selectedElementId);
  const setSelected = useProjectStore((s) => s.setSelectedElement);

  const device = getDevice(previewDeviceId);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [measureTick, setMeasureTick] = useState(0);

  const targetW = device?.width || 1320;
  const targetH = device?.height || 2868;
  const BASE_W = 390;
  const scaleFactor = targetW / BASE_W;
  const computedScale = width / targetW;
  const height = targetH * computedScale;

  const elId = active && selected && selected.startsWith('el:') ? selected.slice(3) : null;
  const selectedEl = elId ? slide.elements?.find((e) => e.id === elId) : undefined;

  useEffect(() => {
    setMeasureTick((t) => t + 1);
  }, [slide.titleTransform, slide.deviceTransform, slide.template, slide.title.fontSize, slide.title.text, slide.title.subtitle, slide.device.scale, slide.elements, selected, width, active]);

  useEffect(() => {
    if (!active) {
      setEditingElementId(null);
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      const ae = document.activeElement as HTMLElement | null;
      const typing = !!ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.isContentEditable);
      const meta = e.metaKey || e.ctrlKey;
      if (editingElementId) return;
      if (meta && (e.key === 'c' || e.key === 'C')) {
        if (elId && !typing) copyElement(slide.id, elId);
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
  }, [active, elId, clipboardElement, editingElementId, slide.id, copyElement, pasteElement, deleteElement, setSelected]);

  const currentTransform: ElementTransform = selectedEl
    ? { x: selectedEl.x, y: selectedEl.y, rotation: selectedEl.rotation, scale: selectedEl.scale }
    : active && selected === 'title'
    ? slide.titleTransform || IDENTITY_TRANSFORM
    : active && selected === 'device'
    ? slide.deviceTransform || IDENTITY_TRANSFORM
    : IDENTITY_TRANSFORM;

  const activate = () => {
    if (!active) onActivate();
  };

  return (
    <div
      ref={canvasWrapperRef}
      className={`rounded-xl bg-surface relative transition-shadow ${active ? 'shadow-canvas ring-2 ring-norte-primary' : 'shadow-md ring-1 ring-border-default hover:ring-border-strong'}`}
      style={{ width, height, flexShrink: 0, overflow: 'visible' }}
      onPointerDown={(e) => {
        activate();
        const target = e.target as HTMLElement;
        if (!target.closest('[data-element]') && !target.closest('[data-overlay]')) {
          setSelected(null);
          setEditingElementId(null);
        }
      }}
    >
      <div style={{ width: '100%', height: '100%', overflow: 'hidden', borderRadius: 'inherit' }}>
        <div
          ref={stageRef}
          style={{ width: targetW, height: targetH, transformOrigin: 'top left', transform: `scale(${computedScale})` }}
        >
          <TemplateRenderer
            slide={slide}
            width={targetW}
            height={targetH}
            language={language}
            editingElementId={editingElementId}
            onElementSelect={(sel) => {
              activate();
              setEditingElementId(null);
              setSelected(sel);
            }}
            onElementTextChange={(id, text) => {
              const el = slide.elements?.find((x) => x.id === id);
              if (!el) return;
              if (el.kind === 'emoji') {
                updateElement(slide.id, id, { emoji: text });
              } else if (language !== BASE_LANGUAGE) {
                setElementLocalizedText(slide.id, id, language, text);
              } else {
                updateElement(slide.id, id, { text });
              }
            }}
            onElementEditStart={(id) => {
              activate();
              setSelected(null);
              setEditingElementId(id);
            }}
            onElementEditEnd={() => setEditingElementId(null)}
            onTitleChange={(value) => {
              if (language !== BASE_LANGUAGE) {
                updateLocalization(slide.id, language, { title: value, subtitle: slide.localizations?.[language]?.subtitle || '' });
              } else {
                updateSlide(slide.id, { title: { ...slide.title, text: value } });
              }
            }}
            onSubtitleChange={(value) => {
              if (language !== BASE_LANGUAGE) {
                updateLocalization(slide.id, language, { title: slide.localizations?.[language]?.title || '', subtitle: value });
              } else {
                updateSlide(slide.id, { title: { ...slide.title, subtitle: value } });
              }
            }}
            onElementPointerDown={(element, e) => {
              const target = e.target as HTMLElement;
              if (target.isContentEditable && document.activeElement === target) return;
              e.preventDefault();
              activate();
              setEditingElementId(null);
              setSelected(element);
            }}
          />
        </div>
      </div>

      {active && (
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
                    setSelected(null);
                    setTimeout(() => {
                      const ce = canvasWrapperRef.current?.querySelector('[data-element="title"] [contenteditable="true"]') as HTMLElement | null;
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
      )}
    </div>
  );
}
