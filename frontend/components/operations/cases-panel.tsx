'use client';

import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit2, Filter, FolderOpen, TrendingUp, UserCircle2 } from 'lucide-react';
import { casesService } from '@/services/cases.service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SectionCard, SegmentedControl, StatCard } from '@/components/ui/workspace';
import { DataTable, type Column } from '@/components/ui/data-table';

const statusStyles: Record<string, 'warning' | 'default' | 'success' | 'danger'> = {
  Pending: 'warning',
  'In Progress': 'default',
  Completed: 'success',
  Escalated: 'danger',
};

export function CasesPanel() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('all');
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<any | null>(null);

  const { data: cases = [], isLoading } = useQuery({
    queryKey: ['cases'],
    queryFn: () => casesService.getAll(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => casesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      setEditorOpen(false);
    },
  });

  const filtered = useMemo(() => {
    return cases.filter((item: any) => status === 'all' || item.status === status);
  }, [cases, status]);

  const openEditor = (item: any) => {
    setSelectedCase(item);
    setEditorOpen(true);
  };

  const handleUpdateStatus = (id: string, newStatus: string) => {
    updateMutation.mutate({ id, data: { status: newStatus } });
  };

  const pendingCount = cases.filter((item: any) => item.status === 'Pending').length;
  const activeCount = cases.filter((item: any) => item.status === 'In Progress').length;
  const completeCount = cases.filter((item: any) => item.status === 'Completed').length;

  const columns = useMemo<Column<any>[]>(
    () => [
      {
        header: 'Case',
        accessorKey: 'caseNumber',
        cell: (row) => (
          <div>
            <p className="font-semibold text-[var(--text-primary)]">{row.title}</p>
            <p className="text-xs text-[var(--text-muted)]">{row.caseNumber}</p>
          </div>
        ),
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: (row) => <Badge variant={statusStyles[row.status]}>{row.status}</Badge>,
      },
      {
        header: 'Priority',
        accessorKey: 'priority',
        cell: (row) => <Badge variant="muted">{row.priority}</Badge>,
      },
      {
        header: 'Owner',
        accessorKey: 'assignedAdmin',
        cell: (row) => (
          <span className="inline-flex items-center gap-2 text-[var(--text-secondary)]">
            {row.assignedAdmin ? (
              <>
                <UserCircle2 className="h-4 w-4 text-[var(--text-muted)]" />
                {row.assignedAdmin.firstName} {row.assignedAdmin.lastName}
              </>
            ) : (
              <span className="text-[var(--text-muted)]">Unassigned</span>
            )}
          </span>
        ),
      },
      {
        header: 'Actions',
        accessorKey: 'id',
        className: 'text-right',
        cell: (row) => (
          <div className="flex justify-end gap-2">
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEditor(row)}>
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <section className="grid gap-3 md:grid-cols-3">
        <StatCard label="Pending" value={pendingCount} icon={FolderOpen} tone="warning" />
        <StatCard label="Active" value={activeCount} icon={TrendingUp} tone="brand" />
        <StatCard label="Completed" value={completeCount} icon={Filter} tone="success" />
      </section>

      <SectionCard title="Case board" description="Operational directory of all system cases.">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <SegmentedControl
            value={status}
            onChange={setStatus}
            options={[
              { value: 'all', label: 'All' },
              { value: 'Pending', label: 'Pending' },
              { value: 'In Progress', label: 'In progress' },
              { value: 'Completed', label: 'Completed' },
            ]}
          />
        </div>

        <DataTable
          data={filtered}
          columns={columns}
          pageSize={10}
          isLoading={isLoading}
          searchPlaceholder="Search case ID or title..."
        />
      </SectionCard>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Case</DialogTitle>
            <DialogDescription>Modify status or details for {selectedCase?.caseNumber}.</DialogDescription>
          </DialogHeader>

          {selectedCase ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <span className="text-sm font-medium">Status</span>
                <select
                  value={selectedCase.status}
                  onChange={(e) => handleUpdateStatus(selectedCase.id, e.target.value)}
                  className="h-11 w-full rounded-[16px] border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[rgba(49,94,251,0.3)] dark:border-white/10 dark:bg-white/[0.06] dark:text-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Escalated">Escalated</option>
                </select>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium">Priority</span>
                <select
                  value={selectedCase.priority}
                  onChange={(e) => updateMutation.mutate({ id: selectedCase.id, data: { priority: e.target.value } })}
                  className="h-11 w-full rounded-[16px] border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[rgba(49,94,251,0.3)] dark:border-white/10 dark:bg-white/[0.06] dark:text-white"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditorOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
