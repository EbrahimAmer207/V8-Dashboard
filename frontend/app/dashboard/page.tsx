'use client';

import React, { useMemo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { RefreshCcw } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuthStore } from '@/store';
import { Alert } from '@/components/common';
import { ActivityTimeline } from '@/components/dashboard/activity-timeline';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton';
import { LiveFeed } from '@/components/dashboard/live-feed';
import { MetricsGrid } from '@/components/dashboard/metrics-grid';
import { PeakActivityChart } from '@/components/dashboard/peak-activity-chart';
import { PerformanceCharts } from '@/components/dashboard/performance-charts';
import { ReportDialog } from '@/components/dashboard/report-dialog';
import { RequestsTable } from '@/components/dashboard/requests-table';
import { SocialFeed } from '@/components/dashboard/social-feed';
import { SlaAlertsPanel } from '@/components/dashboard/sla-alerts-panel';
import { Button } from '@/components/ui/button';
import { EmptyState, SectionCard } from '@/components/ui/workspace';
import { useDashboardLive } from '@/hooks/use-dashboard-live';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [reportOpen, setReportOpen] = useState(false);
  const {
    status,
    snapshot,
    lastSync,
    liveTick,
    unreadCount,
    degradedServices,
    retry,
    markAllNotificationsRead,
    archiveNotification,
  } = useDashboardLive();

  const userName = useMemo(
    () => user?.firstName || user?.username || 'Operator',
    [user?.firstName, user?.username],
  );

  const lastSyncLabel = useMemo(
    () =>
      formatDistanceToNow(lastSync, {
        addSuffix: true,
      }),
    [lastSync],
  );

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6 py-2">
          {status === 'loading' ? <DashboardSkeleton /> : null}

          {status === 'error' ? (
            <SectionCard
              title="Dashboard unavailable"
              description="The live snapshot could not be loaded, so the new UI is surfacing a clearer recovery state."
            >
              <EmptyState
                title="We couldn't load the latest dashboard snapshot."
                description="Retry to restore live data, charts, alerts, and request visibility."
                action={
                  <Button onClick={retry}>
                    <RefreshCcw className="h-4 w-4" />
                    Retry dashboard
                  </Button>
                }
              />
            </SectionCard>
          ) : null}

          {status === 'ready' && snapshot ? (
            <>
              <DashboardHeader
                userName={userName}
                userRole={user?.role}
                lastSyncLabel={lastSyncLabel}
                liveTick={liveTick}
                degradedServices={degradedServices}
                onOpenReport={() => setReportOpen(true)}
              />

              <MetricsGrid metrics={snapshot.metrics} />

              <PerformanceCharts timeline={snapshot.timeline} categories={snapshot.categories} />

              <PeakActivityChart peaks={snapshot.activityPeaks} />

              <section className="grid gap-4 xl:grid-cols-12">
                <div className="xl:col-span-5">
                  <SlaAlertsPanel alerts={snapshot.slaAlerts} />
                </div>
                <div className="xl:col-span-7">
                  <ActivityTimeline activities={snapshot.activities} />
                </div>
              </section>

              <SocialFeed />

              <LiveFeed
                activities={snapshot.activities}
                notifications={snapshot.notifications}
                unreadCount={unreadCount}
                onMarkAllRead={markAllNotificationsRead}
                onArchiveNotification={archiveNotification}
              />

              <RequestsTable requests={snapshot.requests} />
            </>
          ) : null}
        </div>
        <ReportDialog open={reportOpen} onOpenChange={setReportOpen} />
      </MainLayout>
    </ProtectedRoute>
  );
}
