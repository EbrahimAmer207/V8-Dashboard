'use client';

import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Database,
  FileText,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  User as UserIcon,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { apiService } from '@/services/api.service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmptyState, PageIntro, SectionCard, StatCard } from '@/components/ui/workspace';
import { DataTable, type Column } from '@/components/ui/data-table';
import { format } from 'date-fns';
import { SegmentedControl } from '@/components/ui/segmented-control';

export default function ClinicalHubPage() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<'Records' | 'Reports'>('Records');
  const [search, setSearch] = useState('');

  const { data: records = [], isLoading: loadingRecords } = useQuery({
    queryKey: ['clinical-records'],
    queryFn: async () => {
      const response = await apiService.get('/records');
      return response.data?.data || response.data;
    },
  });

  const { data: reports = [], isLoading: loadingReports } = useQuery({
    queryKey: ['clinical-reports'],
    queryFn: async () => {
      const response = await apiService.get('/records/reports');
      return response.data?.data || response.data;
    },
  });

  const deleteRecordMutation = useMutation({
    mutationFn: (id: string) => apiService.post(`/records/${id}/delete`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clinical-records'] }),
  });

  const deleteReportMutation = useMutation({
    mutationFn: (id: string) => apiService.post(`/records/reports/${id}/delete`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clinical-reports'] }),
  });

  const filteredData = useMemo(() => {
    const source = view === 'Records' ? records : reports;
    return source.filter((item: any) => {
      const patientName = `${item.patient?.firstName} ${item.patient?.lastName}`.toLowerCase();
      const info = (item.diagnosis || item.title || '').toLowerCase();
      return patientName.includes(search.toLowerCase()) || info.includes(search.toLowerCase());
    });
  }, [view, records, reports, search]);

  const recordColumns = useMemo<Column<any>[]>(() => [
    {
      header: 'Patient',
      accessorKey: 'patient',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <UserIcon className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-white">
              {row.patient?.firstName} {row.patient?.lastName}
            </p>
            <p className="text-xs text-slate-500">{row.patient?.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Diagnosis',
      accessorKey: 'diagnosis',
      cell: (row) => <span className="text-sm">{row.diagnosis || 'N/A'}</span>,
    },
    {
      header: 'Treatment',
      accessorKey: 'treatment',
      cell: (row) => <span className="text-sm italic text-slate-500">{row.treatment || 'No treatment logged'}</span>,
    },
    {
      header: 'Date',
      accessorKey: 'date',
      cell: (row) => <span className="text-xs text-slate-400">{format(new Date(row.date), 'PPP')}</span>,
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      className: 'text-right',
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="text-rose-500" onClick={() => deleteRecordMutation.mutate(row.id)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Remove Record
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [deleteRecordMutation]);

  const reportColumns = useMemo<Column<any>[]>(() => [
    {
      header: 'Patient',
      accessorKey: 'patient',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
            <UserIcon className="h-4 w-4" />
          </div>
          <p className="font-medium text-slate-900 dark:text-white">
            {row.patient?.firstName} {row.patient?.lastName}
          </p>
        </div>
      ),
    },
    {
      header: 'Report Title',
      accessorKey: 'title',
    },
    {
      header: 'Type',
      accessorKey: 'type',
      cell: (row) => <Badge variant="secondary">{row.type}</Badge>,
    },
    {
      header: 'Date',
      accessorKey: 'date',
      cell: (row) => <span className="text-xs text-slate-400">{format(new Date(row.date), 'PPP')}</span>,
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      className: 'text-right',
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="text-rose-500" onClick={() => deleteReportMutation.mutate(row.id)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Remove Report
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [deleteReportMutation]);

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="mx-auto w-full max-w-[1240px] space-y-6">
          <PageIntro
            eyebrow="Clinical Governance"
            title="Health Hub Directory"
            description="Centralized access to medical histories and diagnostic reports."
          />

          <section className="grid gap-4 md:grid-cols-2">
            <StatCard label="Clinical Records" value={records.length} icon={Database} tone="brand" />
            <StatCard label="Lab Reports" value={reports.length} icon={FileText} tone="success" />
          </section>

          <SectionCard title="Data Explorer" description="Filter and manage clinical assets.">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <SegmentedControl
                value={view}
                onChange={(v) => setView(v as any)}
                options={[
                  { value: 'Records', label: 'Medical Records' },
                  { value: 'Reports', label: 'Lab Reports' },
                ]}
              />
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Search ${view}...`}
                  className="pl-10"
                />
              </div>
            </div>

            <DataTable
              data={filteredData}
              columns={view === 'Records' ? recordColumns : reportColumns}
              pageSize={10}
              isLoading={view === 'Records' ? loadingRecords : loadingReports}
              emptyState={
                <EmptyState
                  title={`No ${view.toLowerCase()} found`}
                  description="Database is empty or search yielded no results."
                  icon={view === 'Records' ? Database : FileText}
                />
              }
            />
          </SectionCard>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
