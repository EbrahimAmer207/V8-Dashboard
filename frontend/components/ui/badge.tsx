import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-[var(--radius-full)] border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] transition-colors',
  {
    variants: {
      variant: {
        default:
          'border-[rgba(49,94,251,0.12)] bg-[rgba(49,94,251,0.07)] text-[var(--accent-strong)] dark:border-sky-300/15 dark:bg-sky-300/10 dark:text-sky-200',
        success:
          'border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-400/15 dark:bg-emerald-400/10 dark:text-emerald-300',
        warning:
          'border-amber-200/80 bg-amber-50 text-amber-700 dark:border-amber-400/15 dark:bg-amber-400/10 dark:text-amber-300',
        danger:
          'border-rose-200/80 bg-rose-50 text-rose-700 dark:border-rose-400/15 dark:bg-rose-400/10 dark:text-rose-300',
        muted:
          'border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-tertiary)]',
        secondary:
          'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300',
        outline:
          'text-[var(--text-primary)] border border-[var(--border)]',
        brand:
          'border-[rgba(49,94,251,0.2)] bg-[rgba(49,94,251,0.1)] text-[var(--accent-strong)] dark:border-sky-300/20 dark:bg-sky-300/15 dark:text-sky-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot ? (
        <span className="h-1.5 w-1.5 rounded-full bg-current animate-[pulse-soft_2s_ease-in-out_infinite]" />
      ) : null}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
