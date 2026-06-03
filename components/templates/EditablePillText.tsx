'use client';

import React, { useEffect, useRef } from 'react';

interface Props {
  value: string;
  onChange?: (v: string) => void;
  style: React.CSSProperties;
  /** Pill background + text color for [bracketed] keywords. */
  pillBg?: string;
  pillColor?: string;
  placeholder?: string;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Render `[keyword]` segments as styled pills. Used when the field is not focused. */
function pillHtml(text: string, pillBg: string, pillColor: string): string {
  if (!text) return '';
  const pill = (w: string) =>
    `<span data-pill="1" style="display:inline-block;background:${pillBg};color:${pillColor};padding:0.04em 0.32em;border-radius:0.26em;line-height:1.04;">${w}</span>`;
  return text
    .split('\n')
    .map((line) => (line ? escapeHtml(line).replace(/\[([^\]]+)\]/g, (_, w) => pill(w)) : '<br>'))
    .join('<br>');
}

/** Plain text with brackets visible — used while editing so the user can edit the markup. */
function rawHtml(text: string): string {
  if (!text) return '';
  return text
    .split('\n')
    .map((line) => (line ? escapeHtml(line) : '<br>'))
    .join('<br>');
}

function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/div>\s*<div>/gi, '\n')
    // Reconstruct [brackets] from pill spans so the markup survives WYSIWYG edits.
    .replace(/<span[^>]*data-pill[^>]*>([^<]*)<\/span>/gi, '[$1]')
    .replace(/<\/?(div|p|span)[^>]*>/gi, '')
    .replace(/<\/?[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n+/g, '\n')
    .replace(/^\n+|\n+$/g, '');
}

/**
 * Headline editor that renders `[keyword]` as a filled pill. Mirrors EditableText's
 * "sync from value only when not focused" behavior; while focused it shows the raw
 * bracket markup so it stays editable, then re-renders pills on blur.
 */
export default function EditablePillText({ value, onChange, style, pillBg = '#111111', pillColor = '#FFFFFF', placeholder }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const lastValue = useRef(value);
  const isFocused = useRef(false);
  const editable = !!onChange;

  useEffect(() => {
    if (ref.current && ref.current.innerHTML === '') {
      ref.current.innerHTML = pillHtml(value, pillBg, pillColor);
      lastValue.current = value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    if (value === lastValue.current) return;
    if (!isFocused.current) {
      lastValue.current = value;
      ref.current.innerHTML = pillHtml(value, pillBg, pillColor);
    }
  }, [value, pillBg, pillColor]);

  const handleInput = () => {
    if (!ref.current || !onChange) return;
    const next = htmlToText(ref.current.innerHTML);
    if (next !== lastValue.current) {
      lastValue.current = next;
      onChange(next);
    }
  };

  return (
    <div
      ref={ref}
      contentEditable={editable}
      suppressContentEditableWarning
      onInput={handleInput}
      onFocus={() => {
        isFocused.current = true;
        if (ref.current) ref.current.innerHTML = rawHtml(lastValue.current);
      }}
      onBlur={() => {
        isFocused.current = false;
        handleInput();
        if (ref.current) ref.current.innerHTML = pillHtml(lastValue.current, pillBg, pillColor);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') (e.target as HTMLElement).blur();
      }}
      onPaste={(e) => {
        if (!editable) return;
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
      }}
      data-placeholder={placeholder}
      data-editable={editable ? 'true' : undefined}
      className={editable ? 'editable-text' : undefined}
      style={{ ...style, outline: 'none', cursor: editable ? 'text' : 'inherit' }}
    />
  );
}

/** Pick black or white text for legibility on a given hex background. */
export function readableTextColor(hex: string): string {
  const m = hex.replace('#', '');
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m;
  const r = parseInt(full.slice(0, 2), 16) || 0;
  const g = parseInt(full.slice(2, 4), 16) || 0;
  const b = parseInt(full.slice(4, 6), 16) || 0;
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? '#111111' : '#FFFFFF';
}
