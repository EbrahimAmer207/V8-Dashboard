'use client';

import { useMemo, useState } from 'react';
import { Activity, BrainCircuit, Check, HeartPulse, UserCircle2 } from 'lucide-react';
import { type HelpRequest, type HelpRequestStatus, type HelpRequestType, type RequestPriority } from '@/lib/dashboard-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SectionCard } from '@/components/ui/workspace';
import { DataTable, type Column } from '@/components/ui/data-table';
import { cn } from '@/lib/utils';

const typeIcons: Record<HelpRequestType, React.ElementType> = {
  Medical: HeartPulse,
  Psychological: BrainCircuit,
  Service: Activity,
};

const typeShells: Record<HelpRequestType, string> = {
  Medical:
    'border-rose-200/60 bg-rose-50 text-rose-600 dark:border-rose-400/15 dark:bg-rose-400/10 dark:text-rose-300',
  Psychological:
    'border-violet-200/60 bg-violet-50 text-violet-600 dark:border-violet-400/15 dark:bg-violet-400/10 dark:text-violet-300',
  Service:
    'border-sky-200/60 bg-sky-50 text-sky-600 dark:border-sky-400/15 dark:bg-sky-400/10 dark:text-sky-300',
};

const priorityTone: Record<RequestPriority, 'danger' | 'warning' | 'default' | 'success'> = {
  Critical: 'danger',
  High: 'warning',
  Medium: 'default',
  Low: 'success',
};

const statusDot: Record<HelpRequestStatus, string> = {
  Pending: 'bg-amber-500',
  'In Progress': 'bg-[var(--accent)]',
  Completed: 'bg-emerald-500',
  Rejected: 'bg-[var(--text-muted)]',
};

const statusColor: Record<HelpRequestStatus, string> = {
  Pending: 'text-amber-600 dark:text-amber-300',
  'In Progress': 'text-[var(--accent)] dark:text-sky-300',
  Completed: 'text-emerald-600 dark:text-emerald-300',
  Rejected: 'text-[var(--text-muted)]',
};

interface RequestsTableProps {
  requests: HelpRequest[];
}

export function RequestsTable({ requests }: RequestsTableProps) {
  const [selectedTypes, setSelectedTypes] = useState<HelpRequestType[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<HelpRequest | null>(null);

  const toggleType = (type: HelpRequestType) => {
    setSelectedTypes((previous) =>
      previous.includes(type)
        ? previous.filter((item) => item !== type)
        : [...previous, type],
    );
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      return selectedTypes.length === 0 || selectedTypes.includes(request.type);
    });
  }, [requests, selectedTypes]);

  const columns = useMemo<Column<HelpRequest>[]>(() => [
    {
      header: 'User & request',
      accessorKey: 'title',
      cell: (row) => {
        const Icon = typeIcons[row.type] || Activity;
        const shellClass = typeShells[row.type] || typeShells.Service;
        return (
          <div className="flex items-start gap-3">
            <div className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border', shellClass)}>
              <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 space-y-0.5">
              <p className="truncate font-semibold text-[var(--text-primary)]">{row.title}</p>
              <p className="text-xs text-[var(--text-muted)]">{row.user}</p>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Priority',
      accessorKey: 'priority',
      cell: (row) => <Badge variant={priorityTone[row.priority]}>{row.priority}</Badge>,
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span className={cn('h-1.5 w-1.5 rounded-full', statusDot[row.status])} />
          <span className={cn('text-sm font-medium', statusColor[row.status])}>{row.status}</span>
        </div>
      ),
    },
    {
      header: 'Assignment',
      accessorKey: 'assignedTo',
      cell: (row) => (
        <span className="inline-flex items-center gap-2 text-[var(--text-secondary)]">
          {row.assignedTo ? (
            <>
              <UserCircle2 className="h-4 w-4 text-[var(--text-muted)]" />
              {row.assignedTo}
            </>
          ) : (
            <span className="text-[var(--text-muted)]">Unassigned</span>
          )}
        </span>
      ),
    },
    {
      header: 'Submitted',
      accessorKey: 'submittedAt',
      className: 'text-right',
      cell: (row) => <span className="text-[var(--text-muted)]">{row.submittedAt}</span>,
    },
  ], []);

  return (
    <>
      <SectionCard
        title="Request board"
        description="Priority, status, assignment, and type are intentionally separated so the eye can resolve each decision dimension faster."
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {(['Medical', 'Psychological', 'Service'] as HelpRequestType[]).map((type) => {
              const selected = selectedTypes.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleType(type)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-[var(--radius-full)] border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-all duration-150',
                    selected
                      ? typeShells[type]
                      : 'border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-tertiary)] hover:border-[var(--border-strong)] hover:text-[var(--text-secondary)]',
                  )}
                >
                  {selected ? <Check className="h-3 w-3" /> : null}
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        <DataTable
          data={filteredRequests}
          columns={columns}
          pageSize={8}
          onRowClick={setSelectedRequest}
          searchPlaceholder="Search by user or request title..."
        />
      </SectionCard>

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="sm:max-w-[560px]">
          {selectedRequest ? (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between gap-3">
                  <Badge variant={priorityTone[selectedRequest.priority]}>{selectedRequest.priority}</Badge>
                  <span className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    {selectedRequest.submittedAt}
                  </span>
                </div>
                <DialogTitle className="pt-2">{selectedRequest.title}</DialogTitle>
                <DialogDescription>
                  Requested by <span className="font-medium text-[var(--text-primary)]">{selectedRequest.user}</span>
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    Triage snapshot
                  </p>
                  <div className="mt-3 space-y-2.5 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[var(--text-tertiary)]">Priority</span>
                      <Badge variant={priorityTone[selectedRequest.priority]}>{selectedRequest.priority}</Badge>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[var(--text-tertiary)]">Status</span>
                      <span className={cn('font-medium', statusColor[selectedRequest.status])}>
                        {selectedRequest.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[var(--text-tertiary)]">Type</span>
                      <Badge variant="muted">{selectedRequest.type}</Badge>
                    </div>
                  </div>
                </div>

                <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    Assignment
                  </p>
                  <div className="mt-3">
                    {selectedRequest.assignedTo ? (
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                          <UserCircle2 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">{selectedRequest.assignedTo}</p>
                          <p className="text-xs text-[var(--text-muted)]">Current owner</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-[var(--text-muted)]">No active assignment yet.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setSelectedRequest(null)}>
                  Close
                </Button>
                <Button>Assign case</Button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
