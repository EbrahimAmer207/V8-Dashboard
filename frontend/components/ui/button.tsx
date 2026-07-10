import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { LoaderCircle } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] border text-sm font-semibold tracking-[-0.01em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-[linear-gradient(135deg,#315efb_0%,#1f6feb_55%,#0ea5e9_100%)] text-white shadow-[0_8px_24px_rgba(49,94,251,0.2)] hover:-translate-y-px hover:shadow-[0_12px_32px_rgba(49,94,251,0.28)] active:translate-y-0 active:shadow-[0_4px_12px_rgba(49,94,251,0.2)]',
        secondary:
          'border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-[var(--shadow-xs)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-strong)] hover:shadow-[var(--shadow-sm)] active:shadow-none dark:bg-white/[0.06] dark:hover:bg-white/[0.1]',
        outline:
          'border-[var(--border)] bg-transparent text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]',
        ghost:
          'border-transparent bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]',
        danger:
          'border-[var(--danger-soft)] bg-[var(--danger-soft)] text-[var(--danger)] shadow-[var(--shadow-xs)] hover:bg-rose-100 dark:border-rose-300/15 dark:bg-rose-400/10 dark:text-rose-200 dark:hover:bg-rose-400/16',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-[var(--radius-sm)] px-3 text-xs',
        lg: 'h-11 px-5 text-sm',
        icon: 'h-10 w-10 rounded-[var(--radius-md)] p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <LoaderCircle className="h-4 w-4 animate-spin" />
      ) : null}
      {children}
    </button>
  ),
);

Button.displayName = 'Button';

export { Button, buttonVariants };
