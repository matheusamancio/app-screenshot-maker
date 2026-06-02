'use client';

import React, { useEffect, useRef } from 'react';

interface Props {
  value: string;
  onChange?: (v: string) => void;
  style: React.CSSProperties;
  multiline?: boolean;
  placeholder?: string;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function textToHtml(text: string): string {
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
    .replace(/<\/?(div|p|span)[^>]*>/gi, '\n')
    .replace(/<\/?[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n+/g, '\n')
    .replace(/^\n+|\n+$/g, '');
}

/**
 * Editable text with line-break support. When `onChange` is provided the div
 * becomes contentEditable; without it, it's a plain rendered div. We sync from
 * `value` only when the element is not focused, so the cursor position is not
 * reset while typing.
 */
export default function EditableText({ value, onChange, style, multiline = true, placeholder }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const lastValue = useRef(value);
  const isFocused = useRef(false);

  // Initial mount: set the html
  useEffect(() => {
    if (ref.current && ref.current.innerHTML === '') {
      ref.current.innerHTML = textToHtml(value);
      lastValue.current = value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync from prop only when not focused
  useEffect(() => {
    if (!ref.current) return;
    if (value === lastValue.current) return;
    if (!isFocused.current) {
      lastValue.current = value;
      ref.current.innerHTML = textToHtml(value);
    }
  }, [value]);

  const editable = !!onChange;

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
      }}
      onBlur={() => {
        isFocused.current = false;
        handleInput();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur();
        }
        if (!multiline && e.key === 'Enter') {
          e.preventDefault();
        }
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
      style={{
        ...style,
        outline: 'none',
        cursor: editable ? 'text' : 'inherit',
      }}
    />
  );
}
