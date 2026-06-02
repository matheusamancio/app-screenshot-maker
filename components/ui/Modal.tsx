'use client';

import React, { useEffect } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  drawer?: boolean;
}

export default function Modal({ open, onClose, title, description, children, footer, size = 'md', drawer = false }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl', xl: 'max-w-6xl', full: 'max-w-[96vw]' };

  return (
    <div className="fixed inset-0 z-[80] bg-black/20 backdrop-blur-sm fade-in" onMouseDown={onClose}>
      <div
        className={
          drawer
            ? 'absolute right-0 top-0 bottom-0 w-full max-w-md bg-surface shadow-canvas flex flex-col'
            : `absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] ${sizes[size]} max-h-[88vh] bg-surface rounded-lg shadow-canvas border border-border-default flex flex-col`
        }
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-5 py-4 border-b border-border-default shrink-0">
          <div>
            <h2 className="font-sora font-semibold text-lg text-primary">{title}</h2>
            {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md flex items-center justify-center text-text-muted hover:bg-overlay hover:text-secondary"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-border-default flex items-center justify-end gap-2 shrink-0">{footer}</div>}
      </div>
    </div>
  );
}
