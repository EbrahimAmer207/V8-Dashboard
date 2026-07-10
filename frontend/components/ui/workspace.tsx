'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Tone = 'brand' | 'neutral' | 'success' | 'warning' | 'danger';

const toneClasses: Record<Tone, string> = {
  brand:
    'border-[rgba(49,94,251,0.1)] bg-[var(--bg-elevated)] dark:border-white/8 dark:bg-[var(--bg-elevated)]',
  neutral:
    'border-[var(--border)] bg-[var(--bg-elevated)] dark:border-white/8',
  success:
    'border-emerald-200/60 bg-[var(--bg-elevated)] dark:border-emerald-400/12',
  warning:
    'border-amber-200/60 bg-[var(--bg-elevated)] dark:border-amber-400/12',
  danger:
    'border-rose-200/60 bg-[var(--bg-elevated)] dark:border-rose-400/12',
};

const iconToneClasses: Record<Tone, string> = {
  brand:
    'bg-[var(--accent-soft)] text-[var(--accent-strong)] dark:bg-sky-400/12 dark:text-sky-300',
  neutral: 'bg-[var(--surface-muted)] text-[var(--text-secondary)] dark:bg-white/8',
  success: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-400/12 dark:text-emerald-300',
  warning: 'bg-amber-50 text-amber-600 dark:bg-amber-400/12 dark:text-amber-300',
  danger: 'bg-rose-50 text-rose-600 dark:bg-rose-400/12 dark:text-rose-300',
};

/* ───────── PageIntro ───────── */

interface PageIntroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
  className?: string;
}

export function PageIntro({
  eyebrow,
  title,
  description,
  actions,
  meta,
  className,
}: PageIntroProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn('flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between', className)}
    >
      <div className="max-w-3xl space-y-2">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text-primary)] sm:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)]">
              {description}
            </p>
          ) : null}
        </div>
        {meta ? <div className="flex flex-wrap items-center gap-2">{meta}</div> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </motion.section>
  );
}

/* ───────── StatCard ───────── */

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  meta?: React.ReactNode;
  trend?: React.ReactNode;
  icon?: LucideIcon;
  tone?: Tone;
  className?: string;
}

export function StatCard({
  label,
  value,
  meta,
  trend,
  icon: Icon,
  tone = 'neutral',
  className,
}: StatCardProps) {
  return (
    <Card className={cn('overflow-hidden rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)]', toneClasses[tone], className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
              {label}
            </p>
            <div className="space-y-0.5">
              <div className="text-2xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">{value}</div>
              {meta ? <div className="text-xs text-[var(--text-tertiary)]">{meta}</div> : null}
            </div>
          </div>
          {Icon ? (
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)]', iconToneClasses[tone])}>
              <Icon className="h-4 w-4" />
            </div>
          ) : null}
        </div>
        {trend ? <div className="mt-3 flex items-center gap-2 text-xs font-medium text-[var(--text-tertiary)]">{trend}</div> : null}
      </CardContent>
    </Card>
  );
}

/* ───────── SectionCard ───────── */

interface SectionCardProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function SectionCard({
  title,
  description,
  actions,
  children,
  className,
  contentClassName,
}: SectionCardProps) {
  return (
    <Card className={cn('overflow-hidden rounded-[var(--radius-lg)] border-[var(--border)] bg-[var(--bg-elevated)] shadow-[var(--shadow-sm)]', className)}>
      <CardHeader className="gap-3 border-b border-[var(--border)] pb-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base text-[var(--text-primary)]">{title}</CardTitle>
            {description ? (
              <CardDescription className="max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)]">
                {description}
              </CardDescription>
            ) : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      </CardHeader>
      <CardContent className={cn('p-5', contentClassName)}>{children}</CardContent>
    </Card>
  );
}

/* ───────── EmptyState ───────── */

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-6 py-12 text-center',
        className,
      )}
    >
      {Icon ? (
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-elevated)] shadow-[var(--shadow-sm)]">
          <Icon className="h-5 w-5 text-[var(--text-muted)]" />
        </div>
      ) : null}
      <div className="max-w-sm space-y-1.5">
        <p className="text-sm font-semibold text-[var(--text-primary)]">{title}</p>
        <p className="text-sm text-[var(--text-secondary)]">{description}</p>
      </div>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

/* ───────── SegmentedControl ───────── */

interface SegmentedControlProps {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  className?: string;
}

export function SegmentedControl({
  value,
  options,
  onChange,
  className,
}: SegmentedControlProps) {
  return (
    <div
      className={cn(
        'inline-flex flex-wrap items-center gap-0.5 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-muted)] p-0.5',
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-[var(--radius-sm)] px-3 py-1.5 text-xs font-semibold transition-all duration-150',
              active
                ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-[var(--shadow-xs)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
