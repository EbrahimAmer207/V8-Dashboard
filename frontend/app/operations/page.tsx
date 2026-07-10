'use client';

import React, { Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { CasesPanel } from '@/components/operations/cases-panel';
import { RequestsPanel } from '@/components/operations/requests-panel';
import { SessionsPanel } from '@/components/operations/sessions-panel';
import { Badge } from '@/components/ui/badge';
import { PageIntro, SegmentedControl } from '@/components/ui/workspace';

export type OperationsTab = 'requests' | 'cases' | 'sessions';

const TAB_OPTIONS: { value: OperationsTab; label: string }[] = [
  { value: 'requests', label: 'Requests' },
  { value: 'cases', label: 'Cases' },
  { value: 'sessions', label: 'Clinical sessions' },
];

function isValidTab(value: string | null): value is OperationsTab {
  return value === 'requests' || value === 'cases' || value === 'sessions';
}

function OperationsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');
  const tab: OperationsTab = isValidTab(rawTab) ? rawTab : 'requests';

  const setTab = (value: string) => {
    router.push(`/operations?tab=${value}`);
  };

  const tabMeta = useMemo(() => {
    if (tab === 'cases') {
      return {
        eyebrow: 'Case operations',
        title: 'Active support cases',
        description: 'Manage escalations and track resolution progress for all support work.',
      };
    }
    if (tab === 'sessions') {
      return {
        eyebrow: 'Clinical schedule',
        title: 'Medical session management',
        description: 'View and control all clinical appointments between doctors and patients.',
      };
    }
    return {
      eyebrow: 'Intake queue',
      title: 'Request triage',
      description: 'Manage incoming help requests and convert them to active cases with full persistence.',
    };
  }, [tab]);

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Clinical operations"
        title="Requests, cases & sessions"
        description="One workspace for intake requests, active cases, and clinical appointments."
        meta={
          <Badge variant="muted">
            <Shield className="h-3.5 w-3.5" />
            SLA targets apply to critical and high priority work
          </Badge>
        }
      />

      <SegmentedControl value={tab} onChange={setTab} options={TAB_OPTIONS} />

      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)]/40 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">{tabMeta.eyebrow}</p>
        <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">{tabMeta.title}</p>
        <p className="mt-0.5 text-sm text-[var(--text-secondary)]">{tabMeta.description}</p>
      </div>

      {tab === 'requests' ? <RequestsPanel /> : null}
      {tab === 'cases' ? <CasesPanel /> : null}
      {tab === 'sessions' ? <SessionsPanel /> : null}
    </div>
  );
}

export default function OperationsPage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <Suspense
          fallback={
            <div className="py-16 text-center text-sm text-[var(--text-muted)]">Loading operations…</div>
          }
        >
          <OperationsPageContent />
        </Suspense>
      </MainLayout>
    </ProtectedRoute>
  );
}
