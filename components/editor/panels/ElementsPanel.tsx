'use client';

import React from 'react';
import { useProjectStore } from '@/store/projectStore';
import type { Slide, Alignment } from '@/types';
import { newTextElement, newEmojiElement } from '@/lib/elements';
import ColorPicker from '../../ui/ColorPicker';
import Slider from '../../ui/Slider';

export default function ElementsPanel({ slide }: { slide: Slide }) {
  const addElement = useProjectStore((s) => s.addElement);
  const updateElement = useProjectStore((s) => s.updateElement);
  const deleteElement = useProjectStore((s) => s.deleteElement);
  const copyElement = useProjectStore((s) => s.copyElement);
  const pasteElement = useProjectStore((s) => s.pasteElement);
  const clipboardElement = useProjectStore((s) => s.clipboardElement);
  const selected = useProjectStore((s) => s.selectedElementId);
  const setSelected = useProjectStore((s) => s.setSelectedElement);

  const elements = slide.elements || [];
  const selId = selected && selected.startsWith('el:') ? selected.slice(3) : null;
  const sel = selId ? elements.find((e) => e.id === selId) : undefined;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => addElement(slide.id, newTextElement())}
          className="h-9 rounded-md bg-norte-primary text-white text-xs font-sora font-semibold hover:bg-norte-primary-hover"
        >
          + Text
        </button>
        <button
          onClick={() => addElement(slide.id, newEmojiElement())}
          className="h-9 rounded-md bg-norte-primary-light text-norte-primary border border-norte-primary/30 text-xs font-semibold hover:bg-norte-primary/10"
        >
          + Sticker
        </button>
      </div>
      {clipboardElement && (
        <button
          onClick={() => pasteElement(slide.id)}
          className="w-full h-8 rounded-md bg-muted border border-border-default text-secondary text-xs font-medium hover:bg-overlay"
        >
          Paste {clipboardElement.kind === 'emoji' ? 'sticker' : 'text'} here (⌘V)
        </button>
      )}

      <div className="text-[11px] text-text-muted leading-relaxed">
        Drag on the canvas to move, double-click text to edit, ⌘C/⌘V to copy a component onto another slide.
      </div>

      {elements.length > 0 && (
        <div className="space-y-1">
          <div className="section-label">On this slide ({elements.length})</div>
          {elements.map((el, i) => (
            <button
              key={el.id}
              onClick={() => setSelected(`el:${el.id}`)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md border text-left ${
                selId === el.id ? 'border-norte-primary bg-norte-primary-light' : 'border-border-default bg-overlay hover:bg-muted'
              }`}
            >
              <span className="text-base w-5 text-center">{el.kind === 'emoji' ? el.emoji : 'T'}</span>
              <span className="text-xs text-secondary truncate flex-1">
                {el.kind === 'emoji' ? 'Sticker' : el.text || 'Text'}
              </span>
              <span className="text-[10px] text-text-muted">#{i + 1}</span>
            </button>
          ))}
        </div>
      )}

      {sel && (
        <div className="border-t border-border-default pt-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="section-label">{sel.kind === 'emoji' ? 'Sticker' : 'Text'} settings</div>
            <div className="flex gap-1.5">
              <button onClick={() => copyElement(slide.id, sel.id)} className="text-[11px] px-2 py-1 rounded bg-muted border border-border-default text-secondary hover:bg-overlay">Copy</button>
              <button onClick={() => deleteElement(slide.id, sel.id)} className="text-[11px] px-2 py-1 rounded bg-muted border border-border-default text-text-muted hover:text-error">Delete</button>
            </div>
          </div>

          {sel.kind === 'text' ? (
            <>
              <textarea
                value={sel.text || ''}
                onChange={(e) => updateElement(slide.id, sel.id, { text: e.target.value })}
                rows={2}
                placeholder="Text"
                className="w-full px-2.5 py-1.5 text-sm bg-surface border border-border-default rounded-md text-secondary resize-none focus:border-norte-primary focus:outline-none"
              />
              <Slider label="Size" value={sel.fontSize || 28} min={10} max={72} suffix="px" onChange={(v) => updateElement(slide.id, sel.id, { fontSize: v })} />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="section-label mb-1.5">Color</div>
                  <ColorPicker color={sel.color || '#111111'} onChange={(c) => updateElement(slide.id, sel.id, { color: c })} />
                </div>
                <div>
                  <div className="section-label mb-1.5">Weight</div>
                  <div className="flex bg-overlay rounded-md p-1 border border-border-default">
                    {([400, 700, 800] as const).map((w) => (
                      <button
                        key={w}
                        onClick={() => updateElement(slide.id, sel.id, { fontWeight: w })}
                        className={`flex-1 py-1 text-xs rounded font-medium ${(sel.fontWeight || 700) === w ? 'bg-surface text-norte-primary shadow-sm' : 'text-text-muted'}`}
                      >
                        {w === 400 ? 'R' : w === 700 ? 'B' : 'XB'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <div className="section-label mb-1.5">Align</div>
                <div className="grid grid-cols-3 gap-1 bg-overlay rounded-md p-1 border border-border-default">
                  {(['left', 'center', 'right'] as Alignment[]).map((a) => (
                    <button
                      key={a}
                      onClick={() => updateElement(slide.id, sel.id, { align: a })}
                      className={`h-7 text-base rounded ${(sel.align || 'center') === a ? 'bg-surface text-norte-primary shadow-sm' : 'text-text-muted'}`}
                    >
                      {a === 'left' ? '←' : a === 'right' ? '→' : '↔'}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <input
                value={sel.emoji || ''}
                onChange={(e) => updateElement(slide.id, sel.id, { emoji: e.target.value })}
                maxLength={4}
                placeholder="⭐"
                className="w-full h-11 text-center text-2xl bg-surface border border-border-default rounded-md focus:border-norte-primary focus:outline-none"
              />
              <Slider label="Size" value={sel.size || 64} min={28} max={140} suffix="px" onChange={(v) => updateElement(slide.id, sel.id, { size: v })} />
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">White tile</span>
                <Toggle on={sel.tile !== false} onToggle={() => updateElement(slide.id, sel.id, { tile: !(sel.tile !== false) })} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">Check badge</span>
                <Toggle on={!!sel.check} onToggle={() => updateElement(slide.id, sel.id, { check: !sel.check })} />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className={`h-6 w-10 rounded-full transition-all ${on ? 'bg-norte-primary' : 'bg-muted'}`}>
      <span className={`block w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );
}
