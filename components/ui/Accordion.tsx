'use client';

import React, { useState } from 'react';

interface Section {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

interface Props {
  sections: Section[];
  defaultOpen?: string;
}

export default function Accordion({ sections, defaultOpen }: Props) {
  const [open, setOpen] = useState<string | null>(defaultOpen || sections[0]?.id || null);

  return (
    <div className="flex flex-col gap-1">
      {sections.map((s) => {
        const isOpen = s.id === open;
        return (
          <div key={s.id} className="rounded-md overflow-hidden">
            <button
              onClick={() => setOpen(isOpen ? null : s.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md ${
                isOpen ? 'bg-muted' : 'bg-muted/60 hover:bg-muted'
              }`}
            >
              <span className="flex items-center gap-2 text-secondary font-medium text-sm">
                {s.icon}
                {s.label}
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {isOpen && (
              <div className="px-3 py-3 fade-in">
                {s.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
