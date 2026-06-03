'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { getDevice } from '@/lib/deviceSizes';
import TemplateRenderer from '../templates/TemplateRenderer';
import TransformController from './TransformController';
import GroupController from './GroupController';
import ContextMenu, { MenuItem } from './ContextMenu';
import type { Slide, Language, ElementTransform } from '@/types';
import { BASE_LANGUAGE, IDENTITY_TRANSFORM } from '@/types';
import { kindLabel } from '@/lib/elements';
import type { SlideElement } from '@/types';

/** Which fields the width/height resize handles edit for a given element kind. */
function resizeFields(el?: SlideElement): { widthField?: 'w' | 'width'; heightField?: 'h'; widthVal?: number; heightVal?: number } {
  if (!el) return {};
  switch (el.kind) {
    case 'text':
      return { widthField: 'width', widthVal: el.width || 300 };
    case 'shape':
    case 'blur':
    case 'card':
    case 'barchart':
    case 'linechart':
    case 'phone':
    case 'habitrow':
      return { widthField: 'w', widthVal: el.w || 200, heightField: 'h', heightVal: el.h || 120 };
    case 'heatmap':
    case 'datestrip':
    case 'streak':
    case 'notification':
      return { widthField: 'w', widthVal: el.w || 300 };
    case 'widget':
      return el.variant === 'today'
        ? { widthField: 'w', widthVal: el.w || 300 }
        : { widthField: 'w', widthVal: el.w || 150, heightField: 'h', heightVal: el.h || 150 };
    case 'button':
      return { heightField: 'h', heightVal: el.h || 56 };
    default:
      return {};
  }
}

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
  const moveElementToSlide = useProjectStore((s) => s.moveElementToSlide);
  const clipboardElement = useProjectStore((s) => s.clipboardElement);
  const selected = useProjectStore((s) => s.selectedElementId);
  const setSelected = useProjectStore((s) => s.setSelectedElement);
  const selectedIds = useProjectStore((s) => s.selectedIds || []);
  const toggleSelectedId = useProjectStore((s) => s.toggleSelectedId);
  const setSelectedIds = useProjectStore((s) => s.setSelectedIds);
  const applyElementPatches = useProjectStore((s) => s.applyElementPatches);
  const deleteSelectedElements = useProjectStore((s) => s.deleteSelectedElements);
  const reorderElement = useProjectStore((s) => s.reorderElement);
  const duplicateElement = useProjectStore((s) => s.duplicateElement);
  const groupElements = useProjectStore((s) => s.groupElements);
  const ungroupElements = useProjectStore((s) => s.ungroupElements);
  const undo = useProjectStore((s) => s.undo);
  const redo = useProjectStore((s) => s.redo);
  const isDraggingElement = useProjectStore((s) => s.isDraggingElement);
  const setDraggingElement = useProjectStore((s) => s.setDraggingElement);

  const device = getDevice(previewDeviceId);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [measureTick, setMeasureTick] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [menu, setMenu] = useState<{ x: number; y: number; id: string } | null>(null);
  const [marquee, setMarquee] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  const marqueeRef = useRef<{ startX: number; startY: number; moved: boolean } | null>(null);

  const targetW = device?.width || 1320;
  const targetH = device?.height || 2868;
  const BASE_W = 390;
  const scaleFactor = targetW / BASE_W;
  const computedScale = width / targetW;
  const height = targetH * computedScale;

  const BASE_H = 844;
  const elId = active && selected && selected.startsWith('el:') ? selected.slice(3) : null;
  const selectedEl = elId ? slide.elements?.find((e) => e.id === elId) : undefined;
  const multi = active && selectedIds.length > 1;
  const groupEls = multi ? (slide.elements || []).filter((e) => selectedIds.includes(e.id)) : [];

  /**
   * Align the active selection. `relativeTo: 'screen'` aligns each element to the
   * slide bounds; `'selection'` aligns them to one another (their shared bounding
   * box). A single element always aligns to the screen.
   */
  const alignTo = (edge: 'left' | 'hcenter' | 'right' | 'top' | 'vcenter' | 'bottom', relativeTo: 'screen' | 'selection' = 'selection') => {
    const ids = selectedIds.length ? selectedIds : elId ? [elId] : [];
    if (!ids.length || !stageRef.current) return;
    const denom = computedScale * scaleFactor || 1;
    const items = ids
      .map((id) => {
        const node = stageRef.current!.querySelector(`[data-element="el:${id}"]`) as HTMLElement | null;
        const el = slide.elements?.find((e) => e.id === id);
        if (!node || !el) return null;
        const r = node.getBoundingClientRect();
        return { id, x: el.x, y: el.y, bw: r.width / denom, bh: r.height / denom };
      })
      .filter(Boolean) as { id: string; x: number; y: number; bw: number; bh: number }[];
    if (!items.length) return;
    let bounds: { left: number; right: number; top: number; bottom: number };
    if (relativeTo === 'screen' || items.length < 2) {
      bounds = { left: 0, right: BASE_W, top: 0, bottom: BASE_H };
    } else {
      bounds = {
        left: Math.min(...items.map((i) => i.x - i.bw / 2)),
        right: Math.max(...items.map((i) => i.x + i.bw / 2)),
        top: Math.min(...items.map((i) => i.y - i.bh / 2)),
        bottom: Math.max(...items.map((i) => i.y + i.bh / 2)),
      };
    }
    const cx = (bounds.left + bounds.right) / 2, cy = (bounds.top + bounds.bottom) / 2;
    const patches: Record<string, Partial<SlideElement>> = {};
    items.forEach((it) => {
      const p: Record<string, number> = {};
      if (edge === 'left') p.x = bounds.left + it.bw / 2;
      else if (edge === 'hcenter') p.x = cx;
      else if (edge === 'right') p.x = bounds.right - it.bw / 2;
      else if (edge === 'top') p.y = bounds.top + it.bh / 2;
      else if (edge === 'vcenter') p.y = cy;
      else p.y = bounds.bottom - it.bh / 2;
      patches[it.id] = p;
    });
    applyElementPatches(slide.id, patches);
  };

  /** Build the right-click menu for the element under the cursor. */
  const buildMenu = (id: string): MenuItem[] => {
    const ids = selectedIds.includes(id) && selectedIds.length > 1 ? selectedIds : [id];
    const targetEl = slide.elements?.find((e) => e.id === id);
    const grouped = !!targetEl?.groupId;
    return [
      { label: 'Bring to front', onClick: () => reorderElement(slide.id, id, 'front') },
      { label: 'Bring forward', onClick: () => reorderElement(slide.id, id, 'forward') },
      { label: 'Send backward', onClick: () => reorderElement(slide.id, id, 'backward') },
      { label: 'Send to back', onClick: () => reorderElement(slide.id, id, 'back') },
      { divider: true },
      {
        label: ids.length > 1 ? 'Align to each other' : 'Align to screen',
        submenu: [
          { label: 'Left', onClick: () => alignTo('left', 'selection') },
          { label: 'Center horizontally', onClick: () => alignTo('hcenter', 'selection') },
          { label: 'Right', onClick: () => alignTo('right', 'selection') },
          { label: 'Top', onClick: () => alignTo('top', 'selection') },
          { label: 'Center vertically', onClick: () => alignTo('vcenter', 'selection') },
          { label: 'Bottom', onClick: () => alignTo('bottom', 'selection') },
        ],
      },
      ...(ids.length > 1
        ? [{
            label: 'Align to screen',
            submenu: [
              { label: 'Left', onClick: () => alignTo('left', 'screen') },
              { label: 'Center horizontally', onClick: () => alignTo('hcenter', 'screen') },
              { label: 'Right', onClick: () => alignTo('right', 'screen') },
              { label: 'Top', onClick: () => alignTo('top', 'screen') },
              { label: 'Center vertically', onClick: () => alignTo('vcenter', 'screen') },
              { label: 'Bottom', onClick: () => alignTo('bottom', 'screen') },
            ],
          } as MenuItem]
        : []),
      { divider: true },
      ...(ids.length > 1 ? [{ label: `Group ${ids.length} items`, onClick: () => { groupElements(slide.id, ids); setSelectedIds(ids); } }] : []),
      ...(grouped ? [{ label: 'Ungroup', onClick: () => ungroupElements(slide.id, ids) }] : []),
      ...(ids.length > 1 || grouped ? [{ divider: true } as MenuItem] : []),
      { label: 'Duplicate', onClick: () => duplicateElement(slide.id, id) },
      { label: 'Copy', onClick: () => copyElement(slide.id, id) },
      { label: 'Delete', danger: true, onClick: () => (ids.length > 1 ? deleteSelectedElements(slide.id) : deleteElement(slide.id, id)) },
    ];
  };

  useEffect(() => {
    setMeasureTick((t) => t + 1);
  }, [slide.titleTransform, slide.deviceTransform, slide.template, slide.title.fontSize, slide.title.text, slide.title.subtitle, slide.device.scale, slide.elements, selected, selectedIds, width, active]);

  // Bridge: the right-panel align buttons dispatch `sf:align`; the active slide
  // runs the DOM-measured alignment for the current selection.
  const alignToRef = useRef(alignTo);
  alignToRef.current = alignTo;
  useEffect(() => {
    if (!active) return;
    const onAlign = (e: Event) => {
      const d = (e as CustomEvent).detail as { edge: 'left' | 'hcenter' | 'right' | 'top' | 'vcenter' | 'bottom'; relativeTo: 'screen' | 'selection' };
      alignToRef.current(d.edge, d.relativeTo);
    };
    window.addEventListener('sf:align', onAlign);
    return () => window.removeEventListener('sf:align', onAlign);
  }, [active]);

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
      if (meta && (e.key === 'z' || e.key === 'Z')) {
        if (typing) return;
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (meta && (e.key === 'y' || e.key === 'Y')) {
        if (typing) return;
        e.preventDefault();
        redo();
        return;
      }
      if (meta && (e.key === 'c' || e.key === 'C')) {
        if (elId && !typing) copyElement(slide.id, elId);
      } else if (meta && (e.key === 'v' || e.key === 'V')) {
        if (clipboardElement && !typing) {
          e.preventDefault();
          pasteElement(slide.id);
        }
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && !typing) {
        if (selectedIds.length > 1) {
          e.preventDefault();
          deleteSelectedElements(slide.id);
        } else if (elId) {
          e.preventDefault();
          deleteElement(slide.id, elId);
        }
      } else if (e.key === 'Escape') {
        setSelected(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, elId, selectedIds, clipboardElement, editingElementId, slide.id, copyElement, pasteElement, deleteElement, deleteSelectedElements, setSelected, undo, redo]);

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

  /**
   * Rubber-band selection: press on empty canvas and drag to draw a rectangle;
   * every element it touches becomes selected (groups expand to all members).
   * If the pointer barely moves it's treated as a plain click → clears selection.
   */
  const startMarquee = (e: React.PointerEvent) => {
    const wrap = canvasWrapperRef.current;
    if (!wrap) return;
    marqueeRef.current = { startX: e.clientX, startY: e.clientY, moved: false };
    const onMove = (ev: PointerEvent) => {
      const m = marqueeRef.current;
      if (!m) return;
      if (!m.moved && Math.hypot(ev.clientX - m.startX, ev.clientY - m.startY) < 4) return;
      m.moved = true;
      const r = wrap.getBoundingClientRect();
      const x0 = m.startX - r.left, y0 = m.startY - r.top;
      const x1 = ev.clientX - r.left, y1 = ev.clientY - r.top;
      setMarquee({ left: Math.min(x0, x1), top: Math.min(y0, y1), width: Math.abs(x1 - x0), height: Math.abs(y1 - y0) });
    };
    const onUp = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      const m = marqueeRef.current;
      marqueeRef.current = null;
      setMarquee(null);
      if (!m || !m.moved) {
        setSelected(null);
        setEditingElementId(null);
        return;
      }
      const minX = Math.min(m.startX, ev.clientX), maxX = Math.max(m.startX, ev.clientX);
      const minY = Math.min(m.startY, ev.clientY), maxY = Math.max(m.startY, ev.clientY);
      const nodes = stageRef.current?.querySelectorAll('[data-element^="el:"]') || [];
      const hit = new Set<string>();
      nodes.forEach((n) => {
        const b = (n as HTMLElement).getBoundingClientRect();
        if (b.right >= minX && b.left <= maxX && b.bottom >= minY && b.top <= maxY) {
          hit.add((n as HTMLElement).getAttribute('data-element')!.slice(3));
        }
      });
      // expand groups to all members
      const els = slide.elements || [];
      Array.from(hit).forEach((id) => {
        const gid = els.find((e) => e.id === id)?.groupId;
        if (gid) els.filter((e) => e.groupId === gid).forEach((e) => hit.add(e.id));
      });
      setSelectedIds(Array.from(hit));
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  return (
    <div
      ref={canvasWrapperRef}
      data-slide-id={slide.id}
      className={`rounded-xl bg-surface relative transition-shadow ${active ? 'shadow-canvas ring-2 ring-norte-primary' : 'shadow-md ring-1 ring-border-default hover:ring-border-strong'}`}
      style={{ width, height, flexShrink: 0, overflow: 'visible', zIndex: dragging ? 50 : undefined }}
      onPointerDown={(e) => {
        if (e.button !== 0) return; // right/middle click handled by onContextMenu
        activate();
        const target = e.target as HTMLElement;
        // Empty canvas → start a rubber-band selection (a plain click clears).
        if (!target.closest('[data-element]') && !target.closest('[data-overlay]')) {
          e.preventDefault(); // suppress native text selection during the drag
          startMarquee(e);
        }
      }}
      onContextMenu={(e) => {
        const target = e.target as HTMLElement;
        const elNode = target.closest('[data-element^="el:"]') as HTMLElement | null;
        // right-click on a component → our menu
        if (elNode) {
          e.preventDefault();
          activate();
          setEditingElementId(null);
          const id = elNode.getAttribute('data-element')!.slice(3);
          if (!selectedIds.includes(id)) {
            const gid = slide.elements?.find((el) => el.id === id)?.groupId;
            if (gid) setSelectedIds((slide.elements || []).filter((el) => el.groupId === gid).map((el) => el.id));
            else setSelected(`el:${id}`);
          }
          setMenu({ x: e.clientX, y: e.clientY, id });
          return;
        }
        // right-click on the selection chrome (overlay) → menu for the current selection
        if (target.closest('[data-overlay]') && elId) {
          e.preventDefault();
          setMenu({ x: e.clientX, y: e.clientY, id: elId });
        }
      }}
    >
      <div style={{ width: '100%', height: '100%', overflow: dragging ? 'visible' : 'hidden', borderRadius: 'inherit' }}>
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
            onElementSelect={(sel, additive) => {
              activate();
              setEditingElementId(null);
              if (additive && sel.startsWith('el:')) {
                toggleSelectedId(sel.slice(3));
                return;
              }
              // Selecting one member of a group selects the whole group
              if (sel.startsWith('el:')) {
                const id = sel.slice(3);
                const gid = slide.elements?.find((e) => e.id === id)?.groupId;
                if (gid) {
                  const ids = (slide.elements || []).filter((e) => e.groupId === gid).map((e) => e.id);
                  setSelectedIds(ids);
                  return;
                }
              }
              setSelected(sel);
            }}
            onElementContextMenu={(id, x, y) => {
              activate();
              setEditingElementId(null);
              if (!selectedIds.includes(id)) {
                const gid = slide.elements?.find((e) => e.id === id)?.groupId;
                if (gid) setSelectedIds((slide.elements || []).filter((e) => e.groupId === gid).map((e) => e.id));
                else setSelected(`el:${id}`);
              }
              setMenu({ x, y, id });
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
            onElementToggleCheck={(id) => {
              const el = slide.elements?.find((x) => x.id === id);
              if (el) updateElement(slide.id, id, { check: !el.check });
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

      {/* Alignment guides — shown on every screen while a component is being moved */}
      {isDraggingElement && (
        <div style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', overflow: 'hidden', pointerEvents: 'none', zIndex: 20 }}>
          {/* dot grid */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(circle, rgba(91,95,237,0.22) 1.1px, transparent 1.2px)',
              backgroundSize: `${width / 14}px ${width / 14}px`,
              backgroundPosition: 'center center',
            }}
          />
          {/* safe-area border guide */}
          <div style={{ position: 'absolute', inset: width * 0.06, border: '1px dashed rgba(91,95,237,0.4)', borderRadius: 10 }} />
          {/* centre cross */}
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, transform: 'translateX(-0.5px)', background: 'rgba(91,95,237,0.55)' }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, transform: 'translateY(-0.5px)', background: 'rgba(91,95,237,0.55)' }} />
        </div>
      )}

      {active && multi && (
        <div data-overlay style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <GroupController
            canvasWrapperRef={canvasWrapperRef}
            stageRef={stageRef}
            computedScale={computedScale}
            scaleFactor={scaleFactor}
            elements={groupEls}
            measureTick={measureTick}
            onApply={(patches) => applyElementPatches(slide.id, patches)}
            onDelete={() => deleteSelectedElements(slide.id)}
          />
        </div>
      )}

      {active && !multi && (
        <div data-overlay style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <TransformController
            canvasWrapperRef={canvasWrapperRef}
            stageRef={stageRef}
            scaleFactor={scaleFactor}
            computedScale={computedScale}
            selected={editingElementId ? null : selected}
            label={selectedEl ? kindLabel(selectedEl.kind) : selected || ''}
            isElement={!!selectedEl}
            transform={currentTransform}
            measureTick={measureTick}
            {...resizeFields(selectedEl)}
            onMoveStart={() => { if (selectedEl) { setDragging(true); setDraggingElement(true); } }}
            onMoveEnd={(clientX, clientY) => {
              setDragging(false);
              setDraggingElement(false);
              if (!elId) return;
              // The dragged element lives in this slide's DOM, so skip wrappers
              // that resolve to the source slide and find the one underneath it.
              const stack = document.elementsFromPoint(clientX, clientY) as HTMLElement[];
              let targetWrap: HTMLElement | null = null;
              for (const node of stack) {
                const w = node.closest?.('[data-slide-id]') as HTMLElement | null;
                if (w && w.getAttribute('data-slide-id') !== slide.id) { targetWrap = w; break; }
              }
              const targetId = targetWrap?.getAttribute('data-slide-id');
              if (!targetId) return; // dropped on the same slide / empty canvas → move already applied via onChange
              const rect = targetWrap!.getBoundingClientRect();
              const bx = ((clientX - rect.left) * BASE_W) / rect.width;
              const by = ((clientY - rect.top) * BASE_W) / rect.width;
              moveElementToSlide(slide.id, targetId, elId, bx, by);
            }}
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

      {/* Rubber-band selection rectangle */}
      {marquee && (
        <div
          style={{
            position: 'absolute',
            left: marquee.left,
            top: marquee.top,
            width: marquee.width,
            height: marquee.height,
            border: '1px solid rgba(91,95,237,0.9)',
            background: 'rgba(91,95,237,0.12)',
            borderRadius: 2,
            pointerEvents: 'none',
            zIndex: 60,
          }}
        />
      )}

      {menu && (
        <ContextMenu x={menu.x} y={menu.y} items={buildMenu(menu.id)} onClose={() => setMenu(null)} />
      )}
    </div>
  );
}
