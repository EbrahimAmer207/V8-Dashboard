'use client';

import React, { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Shield, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { requestsService } from '@/services/requests.service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { RequestsTable } from '@/components/dashboard/requests-table';
import { EmptyState, SectionCard, StatCard } from '@/components/ui/workspace';

function priorityRank(priority: string) {
  const order = ['Critical', 'High', 'Medium', 'Low'];
  return order.indexOf(priority);
}

export function RequestsPanel() {
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['requests'],
    queryFn: () => requestsService.getAll(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => requestsService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['requests'] }),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => requestsService.approveRequest(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['requests'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => requestsService.rejectRequest(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['requests'] }),
  });

  const sorted = useMemo(() => {
    const copy = [...requests];
    copy.sort((left, right) => priorityRank(left.priority) - priorityRank(right.priority));
    return copy;
  }, [requests]);

  const pendingCount = sorted.filter((item) => item.status === 'Pending').length;
  const criticalCount = sorted.filter((item) => item.priority === 'Critical').length;
  const approvedCount = sorted.filter((item) => item.status === 'Approved').length;

  return (
    <div className="space-y-6">
      <section className="grid gap-3 md:grid-cols-3">
        <StatCard label="Pending" value={pendingCount} tone="warning" meta="Awaiting review" />
        <StatCard label="Critical" value={criticalCount} tone="danger" meta="Urgent response needed" />
        <StatCard label="Approved" value={approvedCount} tone="success" meta="Ready for case conversion" />
      </section>

      <RequestsTable requests={sorted} />

      <SectionCard title="Operational queue" description="Act on pending requests in real-time.">
        {isLoading ? <div className="py-8 text-center text-sm text-[var(--text-muted)]">Loading queue…</div> : null}

        {!isLoading && sorted.length === 0 ? (
          <EmptyState title="No active requests" description="The queue is currently clear." icon={Shield} />
        ) : null}

        <div className="grid gap-3">
          <AnimatePresence initial={false}>
            {sorted.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-elevated)] p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-semibold text-[var(--text-primary)]">{item.title}</p>
                      <Badge variant="muted">{item.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      From: {item.user?.firstName} {item.user?.lastName} ({item.user?.email})
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
                    <Select
                      value={item.priority}
                      onChange={(e) => updateMutation.mutate({ id: item.id, data: { priority: e.target.value } })}
                      options={[
                        { value: 'Critical', label: 'Critical' },
                        { value: 'High', label: 'High' },
                        { value: 'Medium', label: 'Medium' },
                        { value: 'Low', label: 'Low' },
                      ]}
                      className="xl:w-[160px]"
                    />

                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        loading={approveMutation.isPending && approveMutation.variables === item.id}
                        onClick={() => approveMutation.mutate(item.id)}
                        disabled={item.status !== 'Pending'}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        loading={rejectMutation.isPending && rejectMutation.variables === item.id}
                        onClick={() => rejectMutation.mutate(item.id)}
                        disabled={item.status === 'Rejected'}
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </SectionCard>
    </div>
  );
}
