'use client';

import React, { useMemo, useState } from 'react';
import { Bell, Trash2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchDashboardSnapshot } from '@/lib/api/dashboard-snapshot';
import type { NotificationItem } from '@/lib/dashboard-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState, PageIntro, SectionCard, SegmentedControl } from '@/components/ui/workspace';
import { motion, AnimatePresence } from 'framer-motion';

const priorityVariant = (priority: NotificationItem['priority']) => {
  if (priority === 'critical' || priority === 'high') return 'danger' as const;
  if (priority === 'medium') return 'warning' as const;
  return 'muted' as const;
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-snapshot'],
    queryFn: () => fetchDashboardSnapshot(),
    enabled: true,
    refetchInterval: 7000,
  });

  const [filter, setFilter] = useState<'all' | NotificationItem['priority']>('all');
  const items = data?.notifications ?? [];

  const filtered = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter((item) => item.priority === filter);
  }, [items, filter]);

  const markRead = () => {
    queryClient.setQueryData(['dashboard-snapshot'], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        notifications: old.notifications.map((item: NotificationItem) => ({ ...item, unread: false })),
      };
    });
  };

  const remove = (id: string) => {
    queryClient.setQueryData(['dashboard-snapshot'], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        notifications: old.notifications.filter((item: NotificationItem) => item.id !== id),
      };
    });
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="mx-auto w-full max-w-[1080px] space-y-6">
          <PageIntro
            eyebrow="Signal inbox"
            title="Notifications with clearer priority and less noise"
            description="Critical warnings should feel operational, not ornamental. The new layout increases readability and makes filtering less effortful."
            actions={
              <Button variant="secondary" onClick={markRead}>
                <Bell className="h-4 w-4" />
                Mark all read
              </Button>
            }
          />

          <SegmentedControl
            value={filter}
            onChange={(value) => setFilter(value as typeof filter)}
            options={[
              { value: 'all', label: 'All' },
              { value: 'critical', label: 'Critical' },
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' },
            ]}
          />

          <SectionCard
            title="Realtime signal feed"
            description="Still powered by the same dashboard snapshot polling contract, now with cleaner grouping and stronger emphasis on what needs attention."
          >
            {isLoading ? (
              <div className="text-sm text-slate-500">Loading notifications…</div>
            ) : null}

            <AnimatePresence initial={false}>
              {filtered.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mb-3 rounded-[24px] border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]"
                >
                  <div className="flex gap-4">
                    <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-[16px] bg-[rgba(49,94,251,0.08)] text-[var(--accent-strong)] dark:bg-white/[0.08] dark:text-sky-100">
                      <Bell className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-semibold text-slate-950 dark:text-white">{item.title}</p>
                          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">{item.body}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.unread ? <Badge variant="danger">Unread</Badge> : null}
                          <Badge variant={priorityVariant(item.priority)}>{item.priority}</Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[11px] uppercase tracking-[0.16em] text-slate-500">{item.relativeTime}</span>
                        <button
                          type="button"
                          onClick={() => remove(item.id)}
                          className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-400 dark:hover:text-white"
                          aria-label="Dismiss notification"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {!isLoading && filtered.length === 0 ? (
              <EmptyState
                title="No notifications for this filter"
                description="Try a broader priority view or wait for the next polling cycle to surface new alerts."
                icon={Bell}
              />
            ) : null}
          </SectionCard>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
