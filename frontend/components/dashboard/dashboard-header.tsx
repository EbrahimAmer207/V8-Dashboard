'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DashboardHeaderProps {
  userName: string;
  userRole?: string;
  lastSyncLabel: string;
  liveTick: number;
  degradedServices: number;
  onOpenReport: () => void;
}

export function DashboardHeader({
  userName,
  userRole,
  lastSyncLabel,
  liveTick,
  degradedServices,
  onOpenReport,
}: DashboardHeaderProps) {
  return (
    <section className="relative overflow-hidden rounded-[34px] border border-[var(--border)] bg-[var(--bg-elevated)] p-6 shadow-[var(--shadow-md)] sm:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(49,94,251,0.08),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.08),transparent_28%)]" />
      <div className="relative grid gap-8 xl:grid-cols-[1.45fr_0.9fr]">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="success">Live workspace</Badge>
            <Badge variant="muted">Updated {lastSyncLabel}</Badge>
            {degradedServices > 0 ? <Badge variant="danger">{degradedServices} degraded services</Badge> : null}
          </div>

          <div className="space-y-4">
            <p className="eyebrow">Operations overview</p>
            <h1 className="max-w-4xl text-balance text-4xl font-semibold tracking-[-0.06em] text-[var(--text-primary)] sm:text-5xl flex flex-wrap items-center gap-x-3 gap-y-1">
              Welcome back,{' '}
              <span className="inline-flex items-center gap-2">
                <span className="text-gradient">{userName}</span>
                {userRole && (userRole.toUpperCase() === 'ADMIN' || userRole.toUpperCase() === 'Admin') && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.15)] backdrop-blur-md">
                    <ShieldCheck className="h-3 w-3 text-sky-400 animate-pulse" />
                    Admin
                  </span>
                )}
              </span>
              . The command surface is ready.
            </h1>
            <p className="max-w-3xl text-base leading-8 text-[var(--text-secondary)]">
              Focus attention where it matters: intake pressure, active work, SLA risk, and the conversations that need a human next step.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={onOpenReport}>
              <Sparkles className="h-4 w-4" />
              Executive snapshot
            </Button>
            <Link
              href="/operations?tab=requests"
              className={cn(buttonVariants({ variant: 'secondary' }), 'inline-flex')}
            >
              <HeartHandshake className="h-4 w-4" />
              Open request queue
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
          <div className="rounded-[26px] border border-[var(--border)] bg-[var(--bg-elevated)] p-5 shadow-[var(--shadow-sm)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Live sync
            </p>
            <div className="mt-4 flex items-center gap-3">
              <motion.div
                key={liveTick}
                initial={{ scale: 0.8, opacity: 0.55 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-300/20 dark:bg-emerald-300/10 dark:text-emerald-100"
              >
                <span className="status-dot text-emerald-500 dark:text-emerald-300" />
              </motion.div>
              <div>
                <p className="text-base font-semibold text-[var(--text-primary)]">Polling healthy</p>
                <p className="text-sm text-[var(--text-muted)]">Last refresh {lastSyncLabel}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[26px] border border-[var(--border)] bg-[var(--bg-elevated)] p-5 shadow-[var(--shadow-sm)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Service posture
            </p>
            <div className="mt-4 space-y-2">
              <p className="text-3xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                {degradedServices}
              </p>
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                {degradedServices === 0
                  ? 'Core intake, chat, and notifications are within healthy bounds.'
                  : 'At least one subsystem is degraded, so incident review should stay visible.'}
              </p>
            </div>
          </div>

          <div className="rounded-[26px] border border-[var(--border)] bg-[var(--bg-elevated)] p-5 shadow-[var(--shadow-sm)]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[rgba(49,94,251,0.08)] text-[var(--accent-strong)] dark:bg-white/[0.08] dark:text-sky-100">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">Operator focus</p>
                <p className="text-sm text-[var(--text-muted)]">Keep urgent work obvious and secondary detail subordinate.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
