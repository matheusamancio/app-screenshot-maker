'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';

type ToastVariant = 'info' | 'success' | 'error';
interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextType {
  toast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = Math.random().toString(36).slice(2, 9);
    setItems((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => setItems((prev) => prev.filter((i) => i.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {items.map((i) => (
          <div
            key={i.id}
            className="pointer-events-auto px-4 py-2.5 rounded-md bg-surface border border-border-default shadow-lg text-sm fade-in flex items-center gap-2"
          >
            {i.variant === 'success' && <span className="w-2 h-2 rounded-full bg-success" />}
            {i.variant === 'error' && <span className="w-2 h-2 rounded-full bg-error" />}
            {i.variant === 'info' && <span className="w-2 h-2 rounded-full bg-norte-primary" />}
            <span className="text-secondary">{i.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return { toast: (m: string) => console.log('[toast]', m) };
  }
  return ctx;
}
