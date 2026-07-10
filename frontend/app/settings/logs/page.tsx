'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  Calendar,
  Filter,
  History,
  Search,
  User as UserIcon,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { apiService } from '@/services/api.service';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { EmptyState, PageIntro, SectionCard, StatCard } from '@/components/ui/workspace';
import { DataTable, type Column } from '@/components/ui/data-table';
import { format } from 'date-fns';

const typeTone = (type: string) => {
  if (type === 'CREATE') return 'success' as const;
  if (type === 'UPDATE') return 'default' as const;
  if (type === 'DELETE') return 'danger' as const;
  if (type === 'LOGIN') return 'brand' as const;
  return 'muted' as const;
};

export default function ActivityLogsPage() {
  const [search, setSearch] = useState('');

  const { data: logsResponse, isLoading } = useQuery({
    queryKey: ['activity-logs'],
    queryFn: async () => {
      const response = await apiService.get('/logs', { params: { limit: 100 } });
      return response.data?.data || response.data;
    },
  });

  const logs = logsResponse?.data || logsResponse || [];

  const filtered = useMemo(() => {
    return logs.filter((l: any) => {
      const actor = `${l.user?.username || l.userId}`.toLowerCase();
      const desc = l.description.toLowerCase();
      const resource = l.resource.toLowerCase();
      return actor.includes(search.toLowerCase()) || desc.includes(search.toLowerCase()) || resource.includes(search.toLowerCase());
    });
  }, [logs, search]);

  const columns = useMemo<Column<any>[]>(() => [
    {
      header: 'Actor',
      accessorKey: 'user',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
            <UserIcon className="h-3 w-3" />
          </div>
          <span className="text-sm font-medium">{row.user?.username || 'System'}</span>
        </div>
      ),
    },
    {
      header: 'Action',
      accessorKey: 'type',
      cell: (row) => <Badge variant={typeTone(row.type)} className="text-[10px]">{row.type}</Badge>,
    },
    {
      header: 'Resource',
      accessorKey: 'resource',
      cell: (row) => <span className="text-xs font-mono text-slate-500">{row.resource}</span>,
    },
    {
      header: 'Description',
      accessorKey: 'description',
      cell: (row) => <p className="max-w-xs truncate text-xs text-slate-600">{row.description}</p>,
    },
    {
      header: 'Timestamp',
      accessorKey: 'createdAt',
      cell: (row) => <span className="text-[10px] text-slate-400 font-mono">{format(new Date(row.createdAt), 'MMM d, HH:mm:ss')}</span>,
    },
  ], []);

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="mx-auto w-full max-w-[1240px] space-y-6">
          <PageIntro
            eyebrow="System Audit"
            title="Activity Explorer"
            description="Track every action across the platform for complete accountability."
          />

          <SectionCard title="Audit Logs" description="Searchable history of system events.">
             <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter logs by actor, resource, or action..."
                  className="pl-10"
                />
              </div>
            </div>

            <DataTable
              data={filtered}
              columns={columns}
              pageSize={15}
              isLoading={isLoading}
              emptyState={
                <EmptyState
                  title="No logs found"
                  description="System activity is either empty or filtered out."
                  icon={History}
                />
              }
            />
          </SectionCard>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
