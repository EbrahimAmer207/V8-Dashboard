/**
 * Premium Form Input Component
 */
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-sm font-semibold text-slate-900 dark:text-slate-100">
            {label}
            {props.required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'flex h-11 w-full rounded-[var(--radius-md)] border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 placeholder-slate-400 transition-all duration-300 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-100 dark:placeholder-slate-500',
              'focus:border-[var(--accent)] focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/10 dark:focus:border-[var(--accent)]',
              'disabled:cursor-not-allowed disabled:opacity-50',
              icon && 'pl-11',
              error && 'border-red-500/50 focus:border-red-500 focus:ring-red-500/30',
              className,
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-sm font-semibold text-slate-900 dark:text-slate-100">
            {label}
            {props.required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'flex h-11 w-full cursor-pointer rounded-[var(--radius-md)] border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 transition-all duration-300 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-100',
            'focus:border-[var(--accent)] focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/10',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500/50 focus:border-red-500 focus:ring-red-500/30',
            className,
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
      </div>
    );
  },
);
Select.displayName = 'Select';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-sm font-semibold text-slate-900 dark:text-slate-100">
            {label}
            {props.required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'flex min-h-[100px] w-full rounded-[var(--radius-md)] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition-all duration-300 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-100 dark:placeholder-slate-500',
            'focus:border-[var(--accent)] focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/10',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'resize-none',
            error && 'border-red-500/50 focus:border-red-500 focus:ring-red-500/30',
            className,
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, ...props }, ref) => {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={ref}
          type="checkbox"
          className={cn(
            'h-4 w-4 cursor-pointer rounded border border-slate-300 bg-white text-blue-600 transition-all duration-200 dark:border-slate-700 dark:bg-slate-900/50',
            'focus:outline-none focus:ring-2 focus:ring-blue-500/30',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
          {...props}
        />
        {label && (
          <label className="cursor-pointer text-sm font-medium text-slate-900 dark:text-slate-100">{label}</label>
        )}
      </div>
    );
  },
);
Checkbox.displayName = 'Checkbox';

interface FormGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const FormGroup: React.FC<FormGroupProps> = ({ children, className }) => (
  <div className={cn('space-y-5', className)}>{children}</div>
);
