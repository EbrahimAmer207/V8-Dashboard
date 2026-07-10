'use client';

import React from 'react';
import { Clock, Loader2, TrendingUp, Users } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardSnapshot } from '@/lib/api/dashboard-snapshot';
import { PerformanceCharts } from '@/components/dashboard/performance-charts';
import { PeakActivityChart } from '@/components/dashboard/peak-activity-chart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState, PageIntro, SectionCard, StatCard } from '@/components/ui/workspace';

export default function AnalyticsPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard-snapshot'],
    queryFn: () => fetchDashboardSnapshot(),
    enabled: true,
    refetchInterval: 9000,
  });

  const growth = data?.metrics?.[0];
  const throughput = data?.metrics?.[3];
  const avgResponse = data?.metrics?.find((metric) => metric.id === 'avg-response');

  return (
    <ProtectedRoute requiredRole={['ADMIN', 'MODERATOR', 'EDITOR', 'PROVIDER']}>
      <MainLayout>
        <div className="space-y-6">
          <PageIntro
            eyebrow="Operational analytics"
            title="Demand, throughput, and staffing clarity"
            description="This screen now reads more like a premium control product: better hierarchy up top, clearer chart framing, and faster visual parsing for leadership questions."
            meta={<Badge variant="muted">Auto-refresh every ~9 seconds</Badge>}
          />

          {isLoading ? (
            <SectionCard title="Loading analytics" description="Pulling the latest snapshot from the existing dashboard contract.">
              <div className="flex items-center gap-3 rounded-[22px] border border-slate-200 bg-slate-50/90 px-4 py-5 text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
                <Loader2 className="h-5 w-5 animate-spin" />
                Preparing charts and operational KPIs…
              </div>
            </SectionCard>
          ) : null}

          {isError ? (
            <SectionCard title="Analytics unavailable" description="The data contract is unchanged; the UI is simply surfacing a cleaner recovery state.">
              <EmptyState
                title="We couldn't load the analytics snapshot."
                description="Retry the query to restore the timeline, category mix, and peak activity views."
                action={
                  <Button variant="secondary" onClick={() => refetch()}>
                    Retry analytics
                  </Button>
                }
              />
            </SectionCard>
          ) : null}

          {data ? (
            <>
              <section className="grid gap-4 md:grid-cols-3">
                <StatCard
                  label="User growth"
                  value={growth?.value.toLocaleString() ?? '—'}
                  icon={Users}
                  tone="brand"
                  meta={`Trend ${growth?.delta ?? 0}% vs prior window`}
                />
                <StatCard
                  label="Resolution throughput"
                  value={throughput?.value.toLocaleString() ?? '—'}
                  icon={TrendingUp}
                  tone="success"
                  meta={`Completed cases with ${throughput?.delta ?? 0}% trend`}
                />
                <StatCard
                  label="Average response"
                  value={avgResponse?.suffix ? `${avgResponse.value}${avgResponse.suffix}` : avgResponse?.value ?? '—'}
                  icon={Clock}
                  tone="neutral"
                  meta="Useful alongside staffing and alert timing"
                />
              </section>

              <PerformanceCharts timeline={data.timeline} categories={data.categories} />

              <PeakActivityChart peaks={data.activityPeaks} />

              <SectionCard
                title="Interpretation guidance"
                description="The charts are framed for decisions, not decoration. The visual hierarchy now helps teams move from signal to action faster."
              >
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-[20px] border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">Demand concentration</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                      Use the timeline to spot windows where incoming requests outpace closures.
                    </p>
                  </div>
                  <div className="rounded-[20px] border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">Category mix</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                      The doughnut is cleaner and easier to scan, making resource allocation less ambiguous.
                    </p>
                  </div>
                  <div className="rounded-[20px] border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">Peak staffing</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                      Compare peak request bars against active admin coverage to plan rotations and escalation windows.
                    </p>
                  </div>
                </div>
              </SectionCard>
            </>
          ) : null}
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
