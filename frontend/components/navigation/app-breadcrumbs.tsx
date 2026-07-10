'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

const LABELS: Record<string, string> = {
  dashboard: 'Overview',
  users: 'Users',
  therapists: 'Therapists',
  operations: 'Clinical operations',
  requests: 'Clinical operations',
  cases: 'Clinical operations',
  sessions: 'Clinical operations',
  social: 'Social community',
  analytics: 'Analytics',
  notifications: 'Notifications',
  chat: 'Chat',
  settings: 'Settings',
  content: 'Content library',
  auth: 'Account',
  login: 'Sign in',
  signup: 'Sign up',
};

export function AppBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-[11px] font-semibold">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 rounded-lg px-1.5 py-0.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/[0.06] dark:hover:text-sky-100"
      >
        <Home className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Home</span>
      </Link>
      {segments.map((seg, i) => {
        const href = '/' + segments.slice(0, i + 1).join('/');
        const isLast = i === segments.length - 1;
        const label = LABELS[seg] ?? seg.replace(/-/g, ' ');
        return (
          <span key={href} className="flex items-center gap-1 text-slate-400 dark:text-slate-600">
            <ChevronRight className="h-3 w-3 shrink-0 opacity-40" />
            {isLast ? (
              <span className="text-[13px] font-medium capitalize tracking-tight text-slate-950 dark:text-slate-100">{label}</span>
            ) : (
              <Link
                href={href}
                className="rounded-lg px-1.5 py-0.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/[0.06] dark:hover:text-sky-100"
              >
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
