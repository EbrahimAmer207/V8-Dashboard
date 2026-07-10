'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthFeature {
  title: string;
  description: string;
  icon: LucideIcon;
}

interface AuthShellProps {
  mode: 'login' | 'signup';
  eyebrow: string;
  title: string;
  description: string;
  sideTitle: string;
  sideDescription: string;
  features: AuthFeature[];
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthShell({
  mode,
  eyebrow,
  title,
  description,
  sideTitle,
  sideDescription,
  features,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f7f8fc_0%,#eef3ff_100%)] dark:bg-[linear-gradient(180deg,#060913_0%,#0a0f1b_100%)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(49,94,251,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.14),transparent_26%)]" />
      <div className="relative grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <aside className="hidden border-r border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(244,247,255,0.7))] px-10 py-10 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,12,21,0.72),rgba(11,17,30,0.9))] lg:flex lg:flex-col lg:justify-between">
          <div className="space-y-12">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-[18px]">
                <img src="/logo.png" alt="Logo" className="h-full w-full object-contain" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
                  Vitality of Enfinity
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Operations workspace</p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <p className="eyebrow">{eyebrow}</p>
                <div className="space-y-3">
                  <h2 className="max-w-lg text-5xl font-semibold tracking-[-0.06em] text-slate-950 dark:text-white">
                    {sideTitle}
                  </h2>
                  <p className="max-w-lg text-base leading-8 text-slate-600 dark:text-slate-400">
                    {sideDescription}
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: 0.1 + index * 0.08 }}
                    className="rounded-[24px] border border-slate-200/70 bg-white/88 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-[linear-gradient(135deg,rgba(49,94,251,0.14),rgba(14,165,233,0.12))] text-[var(--accent-strong)] dark:bg-[linear-gradient(135deg,rgba(96,165,250,0.18),rgba(45,212,191,0.14))] dark:text-sky-100">
                        <feature.icon className="h-4 w-4" />
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-sm font-semibold text-slate-950 dark:text-white">{feature.title}</p>
                        <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">{feature.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-500">
            Designed for calm, precise operations under pressure.
          </p>
        </aside>

        <main className="flex items-center justify-center px-6 py-10 sm:px-8">
          <div className="w-full max-w-[520px]">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-[18px]">
                <img src="/logo.png" alt="Logo" className="h-full w-full object-contain" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
                  Vitality of Enfinity
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Operations workspace</p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="rounded-[32px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_28px_90px_rgba(15,23,42,0.1)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(10,15,28,0.92))] dark:shadow-[0_30px_80px_rgba(2,6,23,0.38)] sm:p-8"
            >
              <div className="space-y-3">
                <p className="eyebrow">{eyebrow}</p>
                <div className="space-y-2">
                  <h1 className="text-3xl font-semibold tracking-[-0.05em] text-slate-950 dark:text-white sm:text-4xl">
                    {title}
                  </h1>
                  <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">{description}</p>
                </div>
              </div>

              <div className="mt-8">{children}</div>

              {mode === 'signup' && (
                <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/70 pt-6 text-sm dark:border-white/10">
                  <div className="text-slate-600 dark:text-slate-400">
                    Already have access?{' '}
                    <Link href="/auth/login" className="font-semibold text-[var(--accent-strong)]">
                      Sign in
                    </Link>
                  </div>
                  <Link
                    href="/auth/login"
                    className={cn(
                      'inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300 dark:hover:bg-white/[0.08]',
                    )}
                  >
                    Go to login
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}

              {footer ? <div className="mt-5">{footer}</div> : null}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
