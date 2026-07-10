import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: Array<{ value: string; label: string }>;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, ...props }, ref) => (
    <div className="group relative">
      <select
        ref={ref}
        className={cn(
          'flex h-11 w-full cursor-pointer appearance-none rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] px-4 pr-10 py-2.5 text-sm font-medium text-[var(--text-primary)] shadow-[var(--shadow-sm)] transition-all duration-300 hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)] hover:shadow-[var(--shadow-md)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-[var(--bg-elevated)] text-[var(--text-primary)]">
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)] transition-transform group-focus-within:rotate-180" />
    </div>
  ),
);

Select.displayName = 'Select';

export { Select };
