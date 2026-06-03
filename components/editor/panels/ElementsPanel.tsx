'use client';

import React from 'react';
import { useProjectStore } from '@/store/projectStore';
import type { Slide, Alignment, SlideElement } from '@/types';
import { newTextElement, newEmojiElement, kindLabel } from '@/lib/elements';
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
              <span className="text-base w-5 text-center">{el.kind === 'emoji' ? el.emoji : el.kind === 'text' ? 'T' : '◫'}</span>
              <span className="text-xs text-secondary truncate flex-1">
                {el.kind === 'text' ? el.text || 'Text' : kindLabel(el.kind)}
              </span>
              <span className="text-[10px] text-text-muted">#{i + 1}</span>
            </button>
          ))}
        </div>
      )}

      {sel && (
        <div className="border-t border-border-default pt-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="section-label">{kindLabel(sel.kind)} settings</div>
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
          ) : sel.kind === 'emoji' ? (
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
          ) : (
            <ComponentEditor sel={sel} update={(patch) => updateElement(slide.id, sel.id, patch)} />
          )}

          {/* Universal: opacity + shadow for every component type */}
          <div className="border-t border-border-default pt-3 space-y-3">
            <Slider label="Opacity" value={Math.round((sel.opacity ?? 1) * 100)} min={5} max={100} suffix="%" onChange={(v) => updateElement(slide.id, sel.id, { opacity: v / 100 })} />
            <Slider label="Shadow" value={sel.shadow ?? 0} min={0} max={40} suffix="px" onChange={(v) => updateElement(slide.id, sel.id, { shadow: v })} />
          </div>
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

function TextField({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-9 px-2.5 text-sm bg-surface border border-border-default rounded-md text-secondary focus:border-norte-primary focus:outline-none"
    />
  );
}

const ICON_OPTIONS = ['check', 'fire', 'lock', 'bell', 'mountain', 'plus', 'play'];

function ComponentEditor({ sel, update }: { sel: SlideElement; update: (patch: Partial<SlideElement>) => void }) {
  const box = sel.kind === 'shape' || sel.kind === 'card';
  return (
    <div className="space-y-3">
      {(sel.kind === 'shape' || sel.kind === 'card' || sel.kind === 'heatmap' || sel.kind === 'datestrip' || sel.kind === 'barchart' || sel.kind === 'linechart' || sel.kind === 'streak' || sel.kind === 'blur') && (
        <Slider label="Width" value={sel.w || 200} min={40} max={380} suffix="px" onChange={(v) => update({ w: v })} />
      )}
      {(box || sel.kind === 'barchart' || sel.kind === 'linechart' || sel.kind === 'blur' || (sel.kind === 'heatmap' && sel.framed)) && (
        <Slider label="Height" value={sel.h || 120} min={40} max={460} suffix="px" onChange={(v) => update({ h: v })} />
      )}
      {box && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="section-label mb-1.5">Background</div>
            <ColorPicker color={sel.bg || '#1C1C1E'} onChange={(c) => update({ bg: c })} />
          </div>
          <div>
            <div className="section-label mb-1.5">Radius</div>
            <Slider label="" value={sel.radius ?? 20} min={0} max={48} onChange={(v) => update({ radius: v })} />
          </div>
        </div>
      )}

      {sel.kind === 'shape' && (
        <>
          <div>
            <div className="section-label mb-1.5">Shape</div>
            <div className="grid grid-cols-5 gap-1.5">
              {(['rect', 'circle', 'pill', 'triangle', 'diamond', 'hexagon', 'star', 'line'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => update({ shapeType: t })}
                  title={t}
                  className={`aspect-square rounded-md border text-[9px] capitalize flex items-center justify-center ${ (sel.shapeType || 'rect') === t ? 'border-norte-primary bg-norte-primary-light text-norte-primary' : 'border-border-default bg-overlay text-secondary'}`}
                >
                  {t === 'rect' ? '▢' : t === 'circle' ? '○' : t === 'pill' ? '▭' : t === 'triangle' ? '△' : t === 'diamond' ? '◇' : t === 'hexagon' ? '⬡' : t === 'star' ? '★' : '─'}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center justify-between gap-2 px-1">
              <span className="section-label">Gradient</span>
              <Toggle on={!!sel.bg2} onToggle={() => update({ bg2: sel.bg2 ? undefined : '#0E0E0F' })} />
            </label>
            {sel.bg2 && (
              <div>
                <div className="section-label mb-1.5">End</div>
                <ColorPicker color={sel.bg2} onChange={(c) => update({ bg2: c })} />
              </div>
            )}
          </div>

          {/* Text label inside the shape — double-click the shape on the canvas to edit it */}
          <div className="border-t border-border-default pt-3 space-y-2">
            <div className="section-label">Label</div>
            <TextField value={sel.text || ''} onChange={(v) => update({ text: v })} placeholder="Double-click the shape to add text" />
            {(sel.text || '').length > 0 && (
              <>
                <Slider label="Text size" value={sel.fontSize || 16} min={8} max={64} suffix="px" onChange={(v) => update({ fontSize: v })} />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="section-label mb-1.5">Text color</div>
                    <ColorPicker color={sel.color || '#FFFFFF'} onChange={(c) => update({ color: c })} />
                  </div>
                  <div>
                    <div className="section-label mb-1.5">Weight</div>
                    <div className="flex bg-overlay rounded-md p-1 border border-border-default">
                      {([400, 700, 800] as const).map((wt) => (
                        <button key={wt} onClick={() => update({ fontWeight: wt })} className={`flex-1 py-1 text-xs rounded font-medium ${(sel.fontWeight || 700) === wt ? 'bg-surface text-norte-primary shadow-sm' : 'text-text-muted'}`}>
                          {wt === 400 ? 'R' : wt === 700 ? 'B' : 'XB'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="section-label mb-1.5">Align</div>
                  <div className="grid grid-cols-3 gap-1 bg-overlay rounded-md p-1 border border-border-default">
                    {(['left', 'center', 'right'] as const).map((a) => (
                      <button key={a} onClick={() => update({ align: a })} className={`h-7 text-base rounded ${(sel.align || 'center') === a ? 'bg-surface text-norte-primary shadow-sm' : 'text-text-muted'}`}>
                        {a === 'left' ? '←' : a === 'right' ? '→' : '↔'}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {sel.kind === 'card' && (
        <>
          <TextField value={sel.cardTitle || ''} onChange={(v) => update({ cardTitle: v })} placeholder="Label (small caps)" />
          <TextField value={sel.cardValue || ''} onChange={(v) => update({ cardValue: v })} placeholder="Big value" />
          <TextField value={sel.cardCaption || ''} onChange={(v) => update({ cardCaption: v })} placeholder="Caption" />
          <div className="grid grid-cols-2 gap-2">
            <Slider label="Value size" value={sel.fontSize || 40} min={14} max={72} suffix="px" onChange={(v) => update({ fontSize: v })} />
            <div>
              <div className="section-label mb-1.5">Accent</div>
              <ColorPicker color={sel.accent || '#FFFFFF'} onChange={(c) => update({ accent: c })} />
            </div>
          </div>
        </>
      )}

      {sel.kind === 'heatmap' && (
        <>
          {sel.framed && (
            <>
              <TextField value={sel.cardTitle || ''} onChange={(v) => update({ cardTitle: v })} placeholder="🏋️ exercitar 20min" />
              <TextField value={sel.cardValue || ''} onChange={(v) => update({ cardValue: v })} placeholder="54 (percent)" />
              <TextField value={sel.cardCaption || ''} onChange={(v) => update({ cardCaption: v })} placeholder="Cada quadrado = um dia · escuro = cumprido" />
            </>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Slider label="Columns" value={sel.cols || 12} min={4} max={20} onChange={(v) => update({ cols: v })} />
            <Slider label="Rows" value={sel.rows || 7} min={3} max={12} onChange={(v) => update({ rows: v })} />
          </div>
          <Slider label="Fill" value={Math.round((sel.fill ?? 0.5) * 100)} min={0} max={100} suffix="%" onChange={(v) => update({ fill: v / 100 })} />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="section-label mb-1.5">Filled cell</div>
              <ColorPicker color={sel.cell || '#1C1C1E'} onChange={(c) => update({ cell: c })} />
            </div>
            <div>
              <div className="section-label mb-1.5">Empty cell</div>
              <ColorPicker color={sel.bg || '#D8D5CE'} onChange={(c) => update({ bg: c })} />
            </div>
          </div>
          {sel.framed && (
            <div>
              <div className="section-label mb-1.5">Card background</div>
              <ColorPicker color={sel.color || '#F4F2ED'} onChange={(c) => update({ color: c })} />
            </div>
          )}
        </>
      )}

      {sel.kind === 'barchart' && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <TextField value={sel.toggleLeft || ''} onChange={(v) => update({ toggleLeft: v })} placeholder="Dia da semana" />
            <TextField value={sel.toggleRight || ''} onChange={(v) => update({ toggleRight: v })} placeholder="Mês a mês" />
          </div>
          <TextField value={sel.days || ''} onChange={(v) => update({ days: v })} placeholder="FEV,MAR,ABR,MAI,JUN" />
          <TextField value={sel.dates || ''} onChange={(v) => update({ dates: v })} placeholder="33,35,36,52,88" />
          <Slider label="Highlight bar" value={sel.activeIndex ?? 4} min={0} max={9} onChange={(v) => update({ activeIndex: v })} />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="section-label mb-1.5">Bar colour</div>
              <ColorPicker color={sel.cell || '#C9C5BD'} onChange={(c) => update({ cell: c })} />
            </div>
            <div>
              <div className="section-label mb-1.5">Highlight</div>
              <ColorPicker color={sel.accent || '#1A1A1A'} onChange={(c) => update({ accent: c })} />
            </div>
          </div>
          <div>
            <div className="section-label mb-1.5">Card background</div>
            <ColorPicker color={sel.bg || '#F4F2ED'} onChange={(c) => update({ bg: c })} />
          </div>
        </>
      )}

      {sel.kind === 'linechart' && (
        <>
          <TextField value={sel.days || ''} onChange={(v) => update({ days: v })} placeholder="Fev,Mar,Abr,Mai,Jun" />
          <div className="grid grid-cols-2 gap-2">
            <TextField value={sel.yTicks || ''} onChange={(v) => update({ yTicks: v })} placeholder="0,23,45" />
            <Slider label="Y max" value={sel.yMax || 50} min={5} max={200} onChange={(v) => update({ yMax: v })} />
          </div>
          <TextField value={sel.cardCaption || ''} onChange={(v) => update({ cardCaption: v })} placeholder="Mais íngreme = mais consistente" />
          {(sel.series || []).map((s, i) => (
            <div key={i} className="rounded-md border border-border-default p-2 space-y-2">
              <div className="flex items-center gap-2">
                <ColorPicker color={s.color} onChange={(c) => update({ series: (sel.series || []).map((x, j) => (j === i ? { ...x, color: c } : x)) })} />
                <input
                  value={s.label}
                  onChange={(e) => update({ series: (sel.series || []).map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })}
                  className="flex-1 min-w-0 px-2 py-1 rounded bg-overlay border border-border-default text-xs text-primary"
                />
              </div>
              <TextField
                value={s.values.map((v) => (v == null ? '' : v)).join(',')}
                onChange={(v) => update({ series: (sel.series || []).map((x, j) => (j === i ? { ...x, values: v.split(',').map((t) => (t.trim() === '' ? null : parseFloat(t))) } : x)) })}
                placeholder="0,6,16,31,45 (empty = no point)"
              />
            </div>
          ))}
          <div>
            <div className="section-label mb-1.5">Card background</div>
            <ColorPicker color={sel.bg || '#F4F2ED'} onChange={(c) => update({ bg: c })} />
          </div>
        </>
      )}

      {sel.kind === 'icon' && (
        <>
          <div>
            <div className="section-label mb-1.5">Icon</div>
            <div className="grid grid-cols-4 gap-1.5">
              {ICON_OPTIONS.map((ic) => (
                <button key={ic} onClick={() => update({ icon: ic })} className={`py-2 rounded-md text-[11px] border ${sel.icon === ic ? 'border-norte-primary bg-norte-primary-light text-norte-primary' : 'border-border-default bg-overlay text-secondary'}`}>{ic}</button>
              ))}
            </div>
          </div>
          {sel.tile ? (
            <Slider label="Size" value={sel.size || 64} min={32} max={160} suffix="px" onChange={(v) => update({ size: v })} />
          ) : (
            <Slider label="Size" value={sel.w || 40} min={16} max={120} suffix="px" onChange={(v) => update({ w: v, h: v })} />
          )}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="section-label mb-1.5">Glyph</div>
              <ColorPicker color={sel.color || '#111111'} onChange={(c) => update({ color: c })} />
            </div>
            {sel.tile && (
              <div>
                <div className="section-label mb-1.5">Tile</div>
                <ColorPicker color={sel.bg || '#1A1A1A'} onChange={(c) => update({ bg: c })} />
              </div>
            )}
          </div>
          {sel.tile && (
            <>
              <Slider label="Corner radius" value={sel.radius ?? 12} min={0} max={Math.round((sel.size || 64) / 2)} suffix="px" onChange={(v) => update({ radius: v })} />
              <label className="flex items-center justify-between gap-2 px-1">
                <span className="section-label">Check badge</span>
                <Toggle on={!!sel.check} onToggle={() => update({ check: !sel.check })} />
              </label>
              {sel.check && (
                <div>
                  <div className="section-label mb-1.5">Badge colour</div>
                  <ColorPicker color={sel.accent || '#E8923C'} onChange={(c) => update({ accent: c })} />
                </div>
              )}
            </>
          )}
        </>
      )}

      {sel.kind === 'button' && (
        <>
          <TextField value={sel.text || ''} onChange={(v) => update({ text: v })} placeholder="Get Norte — Free" />
          <div className="grid grid-cols-2 gap-2">
            <Slider label="Text size" value={sel.fontSize || 17} min={11} max={32} suffix="px" onChange={(v) => update({ fontSize: v })} />
            <Slider label="Height" value={sel.h || 56} min={32} max={96} suffix="px" onChange={(v) => update({ h: v })} />
          </div>
          <Slider label="Radius" value={sel.radius ?? 28} min={0} max={48} onChange={(v) => update({ radius: v })} />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="section-label mb-1.5">Background</div>
              <ColorPicker color={sel.bg || '#1A1A1A'} onChange={(c) => update({ bg: c })} />
            </div>
            <div>
              <div className="section-label mb-1.5">Text colour</div>
              <ColorPicker color={sel.color || '#F4F2ED'} onChange={(c) => update({ color: c })} />
            </div>
          </div>
          <label className="flex items-center justify-between gap-2 px-1">
            <span className="section-label">Trailing arrow →</span>
            <Toggle on={sel.showArrow !== false} onToggle={() => update({ showArrow: sel.showArrow === false })} />
          </label>
          <p className="text-[11px] text-text-muted">Double-click the button on the canvas to edit its text.</p>
        </>
      )}

      {sel.kind === 'blur' && (
        <>
          <Slider label="Blur" value={sel.blur ?? 7} min={1} max={24} suffix="px" onChange={(v) => update({ blur: v })} />
          <Slider label="Radius" value={sel.radius ?? 16} min={0} max={48} onChange={(v) => update({ radius: v })} />
          <p className="text-[11px] text-text-muted">Place over the device to frost the content behind it.</p>
        </>
      )}

      {sel.kind === 'habitrow' && (
        <>
          <div className="grid grid-cols-[auto_1fr] gap-2 items-center">
            <input
              value={sel.emoji || ''}
              onChange={(e) => update({ emoji: e.target.value })}
              className="w-12 px-2 py-1.5 rounded bg-overlay border border-border-default text-center text-lg"
              title="Emoji"
            />
            <TextField value={sel.text || ''} onChange={(v) => update({ text: v })} placeholder="Habit name" />
          </div>
          <TextField value={sel.cardCaption || ''} onChange={(v) => update({ cardCaption: v })} placeholder="7D · 54%" />
          <label className="flex items-center justify-between gap-2 px-1">
            <span className="section-label">Done (checked)</span>
            <Toggle on={!!sel.check} onToggle={() => update({ check: !sel.check })} />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Slider label="Heat cols" value={sel.cols || 7} min={4} max={12} onChange={(v) => update({ cols: v })} />
            <Slider label="Heat rows" value={sel.rows || 6} min={3} max={8} onChange={(v) => update({ rows: v })} />
          </div>
          <Slider label="Heat fill" value={Math.round((sel.fill ?? 0.45) * 100)} min={0} max={100} suffix="%" onChange={(v) => update({ fill: v / 100 })} />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="section-label mb-1.5">Card</div>
              <ColorPicker color={sel.bg || '#F4F2ED'} onChange={(c) => update({ bg: c })} />
            </div>
            <div>
              <div className="section-label mb-1.5">Ink</div>
              <ColorPicker color={sel.color || '#1A1A1A'} onChange={(c) => update({ color: c, cell: c })} />
            </div>
          </div>
          <p className="text-[11px] text-text-muted">Double-click the name to edit it · click the circle on the card to flag/unflag.</p>
        </>
      )}

      {sel.kind === 'phone' && (
        <>
          <Slider label="Width" value={sel.w || 240} min={120} max={360} suffix="px" onChange={(v) => update({ w: v })} />
          <Slider label="Height" value={sel.h || 500} min={200} max={760} suffix="px" onChange={(v) => update({ h: v })} />
          <Slider label="Radius" value={sel.radius ?? 46} min={12} max={72} suffix="px" onChange={(v) => update({ radius: v })} />
          {sel.phoneStyle === 'frame' ? (
            <>
              <div className="grid grid-cols-2 gap-2">
                <TextField value={sel.text || ''} onChange={(v) => update({ text: v })} placeholder="9:41" />
                <TextField value={sel.cardTitle || ''} onChange={(v) => update({ cardTitle: v })} placeholder="NORTE" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="section-label mb-1.5">Bezel</div>
                  <ColorPicker color={sel.bg || '#2B2B2D'} onChange={(c) => update({ bg: c })} />
                </div>
                <div>
                  <div className="section-label mb-1.5">Screen</div>
                  <ColorPicker color={sel.bg2 || '#EFEDE8'} onChange={(c) => update({ bg2: c })} />
                </div>
              </div>
              <p className="text-[11px] text-text-muted">An empty device — drop other components on top to fill the screen.</p>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="section-label mb-1.5">Top colour</div>
                <ColorPicker color={sel.bg || '#000000'} onChange={(c) => update({ bg: c })} />
              </div>
              <div>
                <div className="section-label mb-1.5">Bottom colour</div>
                <ColorPicker color={sel.bg2 || '#A6A6A6'} onChange={(c) => update({ bg2: c })} />
              </div>
            </div>
          )}
          <label className="flex items-center justify-between gap-2 px-1">
            <span className="section-label">Dynamic island</span>
            <Toggle on={sel.island !== false} onToggle={() => update({ island: sel.island === false })} />
          </label>
        </>
      )}

      {sel.kind === 'notification' && (
        <>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <TextField value={sel.cardTitle || ''} onChange={(v) => update({ cardTitle: v })} placeholder="NORTE" />
            <input value={sel.cardValue || ''} onChange={(e) => update({ cardValue: e.target.value })} className="w-16 px-2 py-1.5 rounded bg-overlay border border-border-default text-xs text-primary" title="Time" />
          </div>
          <TextField value={sel.text || ''} onChange={(v) => update({ text: v })} placeholder="Hora de meditar 🧘" />
          <TextField value={sel.cardCaption || ''} onChange={(v) => update({ cardCaption: v })} placeholder="Body text" />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="section-label mb-1.5">Background</div>
              <ColorPicker color={sel.bg || '#FBFAF8'} onChange={(c) => update({ bg: c })} />
            </div>
            <div>
              <div className="section-label mb-1.5">Title ink</div>
              <ColorPicker color={sel.color || '#1A1A1A'} onChange={(c) => update({ color: c })} />
            </div>
          </div>
          <p className="text-[11px] text-text-muted">Double-click on the canvas to edit the title.</p>
        </>
      )}

      {sel.kind === 'widget' && (
        <>
          <div>
            <div className="section-label mb-1.5">Layout</div>
            <div className="grid grid-cols-3 gap-1.5">
              {(['today', 'done', 'month'] as const).map((v) => (
                <button key={v} onClick={() => update({ variant: v })} className={`py-1.5 rounded-md text-[11px] capitalize border ${ (sel.variant || 'today') === v ? 'border-norte-primary bg-norte-primary-light text-norte-primary' : 'border-border-default bg-overlay text-secondary'}`}>{v}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <TextField value={sel.cardTitle || ''} onChange={(v) => update({ cardTitle: v })} placeholder="NORTE · HOJE" />
            <input value={sel.cardValue || ''} onChange={(e) => update({ cardValue: e.target.value })} className="w-20 px-2 py-1.5 rounded bg-overlay border border-border-default text-xs text-primary" title="Header right" />
          </div>
          {(sel.variant || 'today') === 'today' ? (
            <div className="space-y-2">
              <div className="section-label">Rows</div>
              {(sel.items || []).map((it, i) => (
                <div key={i} className="rounded-md border border-border-default p-2 space-y-1.5">
                  <div className="grid grid-cols-[auto_1fr] gap-1.5">
                    <input value={it.emoji} onChange={(e) => update({ items: (sel.items || []).map((x, j) => (j === i ? { ...x, emoji: e.target.value } : x)) })} className="w-10 px-1 py-1 rounded bg-overlay border border-border-default text-center" />
                    <input value={it.name} onChange={(e) => update({ items: (sel.items || []).map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) })} className="min-w-0 px-2 py-1 rounded bg-overlay border border-border-default text-xs text-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    <input value={it.meta} onChange={(e) => update({ items: (sel.items || []).map((x, j) => (j === i ? { ...x, meta: e.target.value } : x)) })} className="w-14 px-2 py-1 rounded bg-overlay border border-border-default text-xs text-primary" placeholder="7d" />
                    <span className="section-label flex-1">Done</span>
                    <Toggle on={it.done} onToggle={() => update({ items: (sel.items || []).map((x, j) => (j === i ? { ...x, done: !x.done } : x)) })} />
                    <button onClick={() => update({ items: (sel.items || []).filter((_, j) => j !== i) })} className="text-[#DC2626] text-xs px-1">✕</button>
                  </div>
                </div>
              ))}
              <button onClick={() => update({ items: [...(sel.items || []), { emoji: '✅', name: 'New habit', meta: '1d', done: false }] })} className="w-full py-1.5 rounded-md border border-dashed border-border-default text-xs text-secondary">+ Add row</button>
            </div>
          ) : (
            <>
              <TextField value={sel.text || ''} onChange={(v) => update({ text: v })} placeholder="Title" />
              <TextField value={sel.cardCaption || ''} onChange={(v) => update({ cardCaption: v })} placeholder={sel.variant === 'month' ? 'ESTE MÊS · 54%' : 'CUMPRIDO HOJE'} />
              {sel.variant === 'done' && (
                <div className="flex items-center gap-2">
                  <TextField value={sel.cardValue2 || ''} onChange={(v) => update({ cardValue2: v })} placeholder="2/30" />
                  <span className="section-label">Done</span>
                  <Toggle on={!!sel.check} onToggle={() => update({ check: !sel.check })} />
                </div>
              )}
              {sel.variant === 'month' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <Slider label="Cols" value={sel.cols || 7} min={4} max={10} onChange={(v) => update({ cols: v })} />
                    <Slider label="Rows" value={sel.rows || 5} min={3} max={7} onChange={(v) => update({ rows: v })} />
                  </div>
                  <Slider label="Fill" value={Math.round((sel.fill ?? 0.5) * 100)} min={0} max={100} suffix="%" onChange={(v) => update({ fill: v / 100 })} />
                </>
              )}
            </>
          )}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="section-label mb-1.5">Background</div>
              <ColorPicker color={sel.bg || '#1A1A1A'} onChange={(c) => update({ bg: c })} />
            </div>
            <div>
              <div className="section-label mb-1.5">Accent</div>
              <ColorPicker color={sel.accent || '#E8923C'} onChange={(c) => update({ accent: c })} />
            </div>
          </div>
        </>
      )}

      {sel.kind === 'stars' && (
        <>
          <Slider label="Count" value={sel.cols || 5} min={1} max={5} onChange={(v) => update({ cols: v })} />
          <Slider label="Size" value={sel.size || 16} min={10} max={40} suffix="px" onChange={(v) => update({ size: v })} />
          <div>
            <div className="section-label mb-1.5">Colour</div>
            <ColorPicker color={sel.color || '#111111'} onChange={(c) => update({ color: c })} />
          </div>
        </>
      )}

      {sel.kind === 'laurel' && (
        <>
          <TextField value={sel.cardValue || ''} onChange={(v) => update({ cardValue: v })} placeholder="+38,420" />
          <TextField value={sel.cardCaption || ''} onChange={(v) => update({ cardCaption: v })} placeholder="Hábitos cumpridos" />
          <Slider label="Size" value={sel.size || 56} min={28} max={120} suffix="px" onChange={(v) => update({ size: v })} />
          <div>
            <div className="section-label mb-1.5">Colour</div>
            <ColorPicker color={sel.color || '#111111'} onChange={(c) => update({ color: c })} />
          </div>
        </>
      )}

      {sel.kind === 'streak' && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <TextField value={sel.cardTitle || ''} onChange={(v) => update({ cardTitle: v })} placeholder="Sequência atual" />
            <TextField value={sel.cardValue || ''} onChange={(v) => update({ cardValue: v })} placeholder="15" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <TextField value={sel.cardTitle2 || ''} onChange={(v) => update({ cardTitle2: v })} placeholder="Recorde" />
            <TextField value={sel.cardValue2 || ''} onChange={(v) => update({ cardValue2: v })} placeholder="24" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <TextField value={sel.unit || ''} onChange={(v) => update({ unit: v })} placeholder="Unit (d)" />
            <label className="flex items-center justify-between gap-2 px-1">
              <span className="section-label">Flame</span>
              <Toggle on={sel.showFire !== false} onToggle={() => update({ showFire: sel.showFire === false })} />
            </label>
          </div>
          <TextField value={sel.cardCaption || ''} onChange={(v) => update({ cardCaption: v })} placeholder="Cumprido hoje" />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="section-label mb-1.5">Card background</div>
              <ColorPicker color={sel.bg || '#1A1A1A'} onChange={(c) => update({ bg: c })} />
            </div>
            <Slider label="Radius" value={sel.radius ?? 28} min={0} max={48} onChange={(v) => update({ radius: v })} />
          </div>
        </>
      )}

      {sel.kind === 'datestrip' && (
        <>
          <TextField value={sel.days || ''} onChange={(v) => update({ days: v })} placeholder="Q,S,S,D,S,T" />
          <TextField value={sel.dates || ''} onChange={(v) => update({ dates: v })} placeholder="28,29,30,31,1,2" />
          <Slider label="Highlight" value={sel.activeIndex ?? 5} min={0} max={9} onChange={(v) => update({ activeIndex: v })} />
        </>
      )}
    </div>
  );
}
