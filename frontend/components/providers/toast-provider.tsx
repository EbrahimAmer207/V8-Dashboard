'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, X, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastVariant = 'success' | 'error' | 'info';

export interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

interface Toast extends ToastInput {
  id: string;
  variant: ToastVariant;
}

const ToastCtx = createContext<{ push: (t: ToastInput) => void } | null>(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const push = useCallback((t: ToastInput) => {
    const id = `t-${Date.now()}`;
    const variant = t.variant ?? 'info';
    setItems((prev) => [...prev, { ...t, id, variant }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((x) => x.id !== id));
    }, 4800);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[200] flex w-[min(100%,380px)] flex-col gap-2">
        <AnimatePresence>
          {items.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              className={cn(
                'pointer-events-auto flex gap-3 rounded-[18px] border px-4 py-3 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl',
                t.variant === 'success' && 'border-emerald-400/20 bg-emerald-950/90 text-emerald-50',
                t.variant === 'error' && 'border-rose-400/25 bg-rose-950/90 text-rose-50',
                t.variant === 'info' && 'border-sky-400/20 bg-slate-950/92 text-slate-100',
              )}
            >
              <div className="mt-0.5">
                {t.variant === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-300" />}
                {t.variant === 'error' && <AlertTriangle className="h-5 w-5 text-rose-300" />}
                {t.variant === 'info' && <Info className="h-5 w-5 text-sky-300" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{t.title}</p>
                {t.description && <p className="mt-0.5 text-xs text-white/75">{t.description}</p>}
              </div>
              <button
                type="button"
                className="rounded-lg p-1 text-white/50 hover:bg-white/10 hover:text-white"
                onClick={() => setItems((prev) => prev.filter((x) => x.id !== t.id))}
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}
