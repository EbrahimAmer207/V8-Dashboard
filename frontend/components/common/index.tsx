'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, Info, LoaderCircle, TriangleAlert } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/* ───────── Loading ───────── */

interface LoadingProps {
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({ fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-elevated)] px-8 py-10 text-center shadow-[var(--shadow-md)]">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-muted)]">
        <LoaderCircle className="h-5 w-5 animate-spin text-[var(--accent)]" />
      </div>
      <div className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
          Syncing workspace
        </p>
        <p className="max-w-xs text-sm text-[var(--text-secondary)]">
          Preparing live metrics, charts, and recent activity.
        </p>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="page-shell flex min-h-screen items-center justify-center px-6 py-10">
        {content}
      </div>
    );
  }

  return <div className="flex items-center justify-center py-10">{content}</div>;
};

/* ───────── Alert ───────── */

interface AlertProps {
  type: 'success' | 'danger' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}

const alertStyles: Record<AlertProps['type'], string> = {
  success: 'border-emerald-200/50 bg-emerald-50 text-emerald-700 dark:border-emerald-400/15 dark:bg-emerald-400/10 dark:text-emerald-300',
  danger: 'border-rose-200/50 bg-rose-50 text-rose-700 dark:border-rose-400/15 dark:bg-rose-400/10 dark:text-rose-300',
  warning: 'border-amber-200/50 bg-amber-50 text-amber-700 dark:border-amber-400/15 dark:bg-amber-400/10 dark:text-amber-300',
  info: 'border-sky-200/50 bg-sky-50 text-sky-700 dark:border-sky-400/15 dark:bg-sky-400/10 dark:text-sky-300',
};

const alertIcons: Record<AlertProps['type'], React.ReactNode> = {
  success: <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />,
  danger: <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />,
  warning: <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />,
  info: <Info className="mt-0.5 h-4 w-4 shrink-0" />,
};

export const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-[var(--radius-md)] border px-4 py-3 text-sm shadow-[var(--shadow-xs)]',
        alertStyles[type],
      )}
      role="alert"
    >
      {alertIcons[type]}
      <div className="flex-1">{message}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="rounded-[var(--radius-sm)] px-2 py-0.5 text-xs font-medium opacity-70 transition hover:opacity-100"
        >
          Dismiss
        </button>
      )}
    </div>
  );
};

/* ───────── ConfirmDialog ───────── */

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Confirm action
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/* ───────── Pagination ───────── */

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-1.5">
      <Button
        variant="secondary"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </Button>
      {pages.map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? 'default' : 'secondary'}
          size="sm"
          onClick={() => onPageChange(page)}
        >
          {page}
        </Button>
      ))}
      <Button
        variant="secondary"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </Button>
    </nav>
  );
};
