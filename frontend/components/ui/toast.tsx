'use client';

import * as React from 'react';
import { CheckCircle2, AlertTriangle, Info, X, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextValue {
  toast: (options: Omit<Toast, 'id'>) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}

const toastStyles: Record<ToastType, { icon: React.ElementType; accent: string; bg: string }> = {
  success: {
    icon: CheckCircle2,
    accent: 'text-emerald-500 dark:text-emerald-400',
    bg: 'border-emerald-200/50 dark:border-emerald-400/15',
  },
  error: {
    icon: XCircle,
    accent: 'text-rose-500 dark:text-rose-400',
    bg: 'border-rose-200/50 dark:border-rose-400/15',
  },
  warning: {
    icon: AlertTriangle,
    accent: 'text-amber-500 dark:text-amber-400',
    bg: 'border-amber-200/50 dark:border-amber-400/15',
  },
  info: {
    icon: Info,
    accent: 'text-[var(--accent)] dark:text-sky-400',
    bg: 'border-[var(--accent-soft)] dark:border-sky-400/15',
  },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const style = toastStyles[toast.type];
  const Icon = style.icon;

  React.useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-[var(--radius-lg)] border bg-[var(--bg-elevated)] px-4 py-3 shadow-[var(--shadow-lg)] animate-[slide-up_250ms_ease] w-[360px] max-w-[calc(100vw-2rem)]',
        style.bg,
      )}
    >
      <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', style.accent)} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--text-primary)]">{toast.title}</p>
        {toast.description ? (
          <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{toast.description}</p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 rounded-[var(--radius-sm)] p-1 text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)]"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function ToastContainer({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((options: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { ...options, id }]);
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col-reverse gap-2">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
