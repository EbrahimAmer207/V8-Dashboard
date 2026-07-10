'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SegmentedControlProps {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  className?: string;
}

export function SegmentedControl({ value, onChange, options, className }: SegmentedControlProps) {
  return (
    <div
      className={cn(
        'relative flex items-center gap-1 rounded-[var(--radius-md)] bg-[var(--surface-muted)] p-1 border border-[var(--border)]',
        className
      )}
    >
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'relative z-10 flex-1 px-4 py-1.5 text-xs font-semibold transition-colors duration-200 focus-visible:outline-none',
              isActive ? 'text-[var(--accent-strong)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="segmented-active"
                className="absolute inset-0 z-0 rounded-[calc(var(--radius-md)-2px)] bg-[var(--bg-elevated)] shadow-[var(--shadow-sm)] border border-[var(--border)]"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
