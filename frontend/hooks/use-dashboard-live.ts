'use client';

import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { type DashboardSnapshot } from '@/lib/dashboard-data';
import { fetchDashboardSnapshot } from '@/lib/api/dashboard-snapshot';

export function useDashboardLive() {
  const queryClient = useQueryClient();

  const { data: snapshot, isLoading, error, dataUpdatedAt, refetch } = useQuery<DashboardSnapshot>({
    queryKey: ['dashboard-snapshot'],
    queryFn: () => fetchDashboardSnapshot(),
    enabled: true,
    refetchInterval: 5000,
  });

  const status = isLoading ? 'loading' : error ? 'error' : 'ready';
  const liveTick = dataUpdatedAt || Date.now();
  const lastSync = useMemo(
    () => (snapshot?.updatedAt ? new Date(snapshot.updatedAt) : new Date(dataUpdatedAt || Date.now())),
    [snapshot?.updatedAt, dataUpdatedAt],
  );

  const unreadCount = useMemo(
    () => snapshot?.notifications?.filter((item) => item.unread).length ?? 0,
    [snapshot],
  );

  const degradedServices = useMemo(
    () => snapshot?.health?.filter((item) => item.status === 'degraded').length ?? 0,
    [snapshot],
  );

  const retry = () => {
    refetch();
  };

  const markAllNotificationsRead = () => {
    queryClient.setQueryData(['dashboard-snapshot'], (old: DashboardSnapshot | undefined) => {
      if (!old) return old;
      return {
        ...old,
        notifications: old.notifications.map((item) => ({ ...item, unread: false })),
      };
    });
  };

  const archiveNotification = (id: string) => {
    queryClient.setQueryData(['dashboard-snapshot'], (old: DashboardSnapshot | undefined) => {
      if (!old) return old;
      return {
        ...old,
        notifications: old.notifications.filter((item) => item.id !== id),
      };
    });
  };

  return {
    status,
    snapshot: snapshot || null,
    liveTick,
    lastSync,
    unreadCount,
    degradedServices,
    retry,
    markAllNotificationsRead,
    archiveNotification,
  };
}
