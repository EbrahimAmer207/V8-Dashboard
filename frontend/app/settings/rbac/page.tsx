'use client';

import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Key,
  Lock,
  MoreHorizontal,
  Plus,
  Shield,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { apiService } from '@/services/api.service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmptyState, PageIntro, SectionCard, StatCard } from '@/components/ui/workspace';
import { DataTable, type Column } from '@/components/ui/data-table';
import { format } from 'date-fns';

export default function RolesPage() {
  const queryClient = useQueryClient();

  const { data: roles = [], isLoading: loadingRoles } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await apiService.get('/roles');
      return response.data?.data || response.data;
    },
  });

  const { data: permissions = [], isLoading: loadingPerms } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const response = await apiService.get('/permissions');
      return response.data?.data || response.data;
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (id: string) => apiService.delete(`/roles/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  });

  const columns = useMemo<Column<any>[]>(() => [
    {
      header: 'Role Name',
      accessorKey: 'name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Shield className="h-4 w-4" />
          </div>
          <span className="font-semibold text-slate-900 dark:text-white uppercase tracking-wider">{row.name}</span>
        </div>
      ),
    },
    {
      header: 'Description',
      accessorKey: 'description',
      cell: (row) => <span className="text-sm text-slate-500">{row.description || 'No description provided'}</span>,
    },
    {
      header: 'Permissions',
      accessorKey: 'permissions',
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.permissions?.map((p: any) => (
            <Badge key={p.id} variant="secondary" className="text-[10px] py-0">
              {p.resource}:{p.action}
            </Badge>
          ))}
          {(!row.permissions || row.permissions.length === 0) && <span className="text-xs text-slate-400 italic">No permissions</span>}
        </div>
      ),
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
            <DropdownMenuItem>Manage Permissions</DropdownMenuItem>
            <DropdownMenuItem className="text-rose-500" onClick={() => deleteRoleMutation.mutate(row.id)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Role
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [deleteRoleMutation]);

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="mx-auto w-full max-w-[1240px] space-y-6">
          <PageIntro
            eyebrow="Security Settings"
            title="Access Control (RBAC)"
            description="Define roles and assign granular permissions to users."
          />

          <section className="grid gap-4 md:grid-cols-2">
            <StatCard label="Defined Roles" value={roles.length} icon={ShieldCheck} tone="brand" />
            <StatCard label="Global Permissions" value={permissions.length} icon={Key} tone="success" />
          </section>

          <SectionCard title="Role Directory" description="Manage platform access levels.">
             <div className="mb-6 flex justify-end">
              <Button size="sm" className="bg-[var(--accent-strong)] hover:bg-[var(--accent-strong)]/90">
                <Plus className="mr-2 h-4 w-4" />
                Add New Role
              </Button>
            </div>

            <DataTable
              data={roles}
              columns={columns}
              pageSize={10}
              isLoading={loadingRoles}
              emptyState={
                <EmptyState
                  title="No roles defined"
                  description="Start by creating an administrative or staff role."
                  icon={Lock}
                />
              }
            />
          </SectionCard>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
