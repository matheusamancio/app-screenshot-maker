'use client';

import React, { useEffect, useRef, useState } from 'react';

interface Option<T> {
  value: T;
  label: string;
  badge?: string;
  group?: string;
}

interface Props<T> {
  value: T;
  options: Option<T>[];
  onChange: (v: T) => void;
  placeholder?: string;
  className?: string;
  width?: string;
}

export default function Dropdown<T extends string>({
  value,
  options,
  onChange,
  placeholder = 'Select…',
  className = '',
  width = 'w-full',
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const current = options.find((o) => o.value === value);
  const groups: { [g: string]: Option<T>[] } = {};
  let hasGroups = false;
  options.forEach((o) => {
    const g = o.group || '__';
    if (o.group) hasGroups = true;
    groups[g] = groups[g] || [];
    groups[g].push(o);
  });

  return (
    <div className={`relative ${width} ${className}`} ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full h-9 px-3 bg-overlay border border-border-default rounded-md flex items-center justify-between text-sm text-secondary hover:border-border-strong"
      >
        <span className="truncate">{current?.label || placeholder}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 left-0 right-0 bg-surface border border-border-default rounded-md shadow-md py-1 max-h-72 overflow-y-auto fade-in">
          {hasGroups
            ? Object.entries(groups).map(([g, opts]) => (
                <div key={g}>
                  {g !== '__' && <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">{g}</div>}
                  {opts.map((o) => (
                    <button
                      key={String(o.value)}
                      onClick={() => {
                        onChange(o.value);
                        setOpen(false);
                      }}
                      className={`w-full px-3 py-1.5 text-left text-sm hover:bg-overlay flex items-center justify-between ${
                        o.value === value ? 'text-norte-primary font-medium' : 'text-secondary'
                      }`}
                    >
                      <span>{o.label}</span>
                      {o.badge && <span className="text-[10px] text-text-muted">{o.badge}</span>}
                    </button>
                  ))}
                </div>
              ))
            : options.map((o) => (
                <button
                  key={String(o.value)}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={`w-full px-3 py-1.5 text-left text-sm hover:bg-overlay flex items-center justify-between ${
                    o.value === value ? 'text-norte-primary font-medium' : 'text-secondary'
                  }`}
                >
                  <span>{o.label}</span>
                  {o.badge && <span className="text-[10px] text-text-muted">{o.badge}</span>}
                </button>
              ))}
        </div>
      )}
    </div>
  );
}
