'use client';

import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  MoreHorizontal,
  Plus,
  Save,
  Shield,
  UserCheck,
  UserX,
  Users,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { userService } from '@/services/user.service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { PageIntro, SectionCard, SegmentedControl, StatCard } from '@/components/ui/workspace';
import { DataTable, type Column } from '@/components/ui/data-table';

type UserFormValues = {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  role: string;
  type: string;
  region: string;
  status: string;
};

const typeTone = (value: string) => {
  if (value === 'SEEKER' || value === 'Seeker') return 'default' as const;
  if (value === 'PROVIDER' || value === 'Provider') return 'warning' as const;
  if (value === 'ADMIN' || value === 'Admin') return 'danger' as const;
  return 'muted' as const;
};

const statusTone = (value: string) => {
  if (value === 'Active') return 'success' as const;
  if (value === 'Banned') return 'danger' as const;
  return 'muted' as const;
};

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'All' | 'SEEKER' | 'PROVIDER'>('All');
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const userForm = useForm<UserFormValues>({
    defaultValues: {
      email: '',
      username: '',
      firstName: '',
      lastName: '',
      password: '',
      role: 'USER',
      type: 'SEEKER',
      region: 'MENA',
      status: 'Active',
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = userForm;

  const openUserDialog = (user?: any) => {
    setMutationError(null);
    if (user) {
      reset({
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        password: '',
        role: user.role || 'USER',
        type: user.type || 'SEEKER',
        region: user.region || 'MENA',
        status: user.status || 'Active',
      });
      setSelectedUser(user);
    } else {
      reset({
        email: '',
        username: '',
        firstName: '',
        lastName: '',
        password: '',
        role: 'USER',
        type: 'SEEKER',
        region: 'MENA',
        status: 'Active',
      });
      setSelectedUser(null);
    }
    setUserDialogOpen(true);
  };

  const closeUserDialog = () => {
    setUserDialogOpen(false);
    setSelectedUser(null);
    setMutationError(null);
    reset({
      email: '',
      username: '',
      firstName: '',
      lastName: '',
      password: '',
      role: 'USER',
      type: 'SEEKER',
      region: 'MENA',
      status: 'Active',
    });
  };

  // We use the DataTable's internal search but the backend still handles the query key
  const { data: usersResponse, isLoading } = useQuery({
    queryKey: ['users', filter],
    queryFn: () => userService.getAll({ type: filter !== 'All' ? filter : undefined }),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => userService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      closeUserDialog();
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to create user';
      setMutationError(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => userService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      closeUserDialog();
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to update user';
      setMutationError(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to delete user';
      setMutationError(message);
    },
  });

  const users = usersResponse ?? [];

  const stats = useMemo(
    () => ({
      total: users.length,
      seekers: users.filter((u: any) => u.type === 'SEEKER' || u.type === 'Seeker').length,
      therapists: users.filter((u: any) => u.type === 'PROVIDER' || u.type === 'Provider').length,
      banned: users.filter((u: any) => u.status === 'Banned').length,
    }),
    [users],
  );

  const banUser = (id: string) => updateMutation.mutate({ id, data: { status: 'Banned', isActive: false } });
  const activateUser = (id: string) => updateMutation.mutate({ id, data: { status: 'Active', isActive: true } });

  const handleRemove = (id: string) => {
    if (confirm('Are you sure you want to PERMANENTLY delete this user account? This action cannot be undone if they have no active records.')) {
      deleteMutation.mutate(id);
    }
  };

  const saveUser = async (formData: UserFormValues) => {
    try {
      const payload: Record<string, unknown> = { ...formData };
      if (selectedUser && !payload.password) {
        delete payload.password;
      }

      if (selectedUser) {
        await updateMutation.mutateAsync({ id: selectedUser.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to save user';
      setMutationError(message);
    }
  };

  const columns = useMemo<Column<any>[]>(() => [
    {
      header: 'User',
      accessorKey: 'email',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent-soft)] text-xs font-semibold text-[var(--accent-strong)]">
            {row.firstName?.[0]}{row.lastName?.[0]}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
              {row.firstName} {row.lastName}
              {row.role && (row.role.toUpperCase() === 'ADMIN' || row.role === 'Admin') && (
                <span className="inline-flex items-center gap-1 rounded-full border border-sky-400/20 bg-sky-500/10 px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider text-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.1)]">
                  Admin
                </span>
              )}
            </p>
            <p className="truncate text-xs text-[var(--text-muted)]">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Type',
      accessorKey: 'type',
      cell: (row) => <Badge variant={typeTone(row.type)}>{row.type || 'SEEKER'}</Badge>,
    },
    {
      header: 'Role',
      accessorKey: 'role',
      cell: (row) => {
        const isAdm = row.role?.toUpperCase() === 'ADMIN' || row.role === 'Admin';
        return (
          <Badge variant={isAdm ? 'danger' : 'muted'}>
            {row.role || 'USER'}
          </Badge>
        );
      },
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => <Badge variant={statusTone(row.status)}>{row.status}</Badge>,
    },
    {
      header: 'Requests',
      accessorKey: 'requestCount',
      className: 'text-center',
      cell: (row) => <span className="text-xs font-medium text-[var(--text-muted)]">{row.requestCount ?? 0}</span>,
    },
    {
      header: 'Region',
      accessorKey: 'region',
      className: 'text-[var(--text-secondary)]',
      cell: (row) => row.region || 'MENA',
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      className: 'text-right',
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openUserDialog(row)}>Edit user</DropdownMenuItem>
            {row.status !== 'Banned' ? (
              <DropdownMenuItem onClick={() => banUser(row.id)}>Ban user</DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => activateUser(row.id)}>Activate user</DropdownMenuItem>
            )}
            <DropdownMenuItem className="text-rose-500 focus:text-rose-500" onClick={(e) => { e.stopPropagation(); handleRemove(row.id); }}>
              Delete user
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [users]);

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6">
          <PageIntro
            eyebrow="Platform access"
            title="User management with stronger scanning and cleaner editing"
            description="The redesign keeps the exact same create, update, ban, activate, and deactivate behavior while giving the team a more structured operational view."
            actions={
              <Button onClick={() => openUserDialog()}>
                <Plus className="h-4 w-4" />
                New user
              </Button>
            }
          />

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total users" value={stats.total} icon={Users} tone="brand" />
            <StatCard label="Seekers" value={stats.seekers} icon={UserCheck} tone="neutral" />
            <StatCard label="Therapists" value={stats.therapists} icon={Shield} tone="success" />
            <StatCard label="Banned" value={stats.banned} icon={UserX} tone="danger" />
          </section>

          <SectionCard
            title="Directory"
            description="Search, filter, and adjust user access without losing context or action visibility."
          >
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <SegmentedControl
                value={filter}
                onChange={(value) => setFilter(value as typeof filter)}
                options={[
                  { value: 'All', label: 'Everyone' },
                  { value: 'SEEKER', label: 'Seekers' },
                  { value: 'PROVIDER', label: 'Therapists' },
                ]}
              />
            </div>

            <DataTable
              data={users}
              columns={columns}
              pageSize={10}
              onRowClick={openUserDialog}
              searchPlaceholder="Search by name, email, or region..."
              emptyState={
                !isLoading ? (
                  <div className="py-12 text-center">
                    <Users className="mx-auto h-8 w-8 text-[var(--text-muted)] mb-3" />
                    <p className="font-medium text-[var(--text-primary)]">No users found</p>
                    <p className="text-xs text-[var(--text-secondary)]">Try a broader filter or search query to bring records back into view.</p>
                  </div>
                ) : (
                  <div className="py-12 text-center text-sm text-[var(--text-muted)]">
                    Loading users directory...
                  </div>
                )
              }
            />
          </SectionCard>

          <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{selectedUser ? 'Edit user' : 'Create user'}</DialogTitle>
                <DialogDescription>
                  {selectedUser
                    ? 'Update access, status, and identity fields while preserving backend behavior.'
                    : 'Create a new platform account for a seeker or therapist.'}
                </DialogDescription>
              </DialogHeader>

              {mutationError ? (
                <div className="rounded-[var(--radius-md)] border border-rose-200/50 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-400/15 dark:bg-rose-400/10 dark:text-rose-200">
                  {mutationError}
                </div>
              ) : null}

              <form onSubmit={handleSubmit(saveUser)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <span className="caption text-[var(--text-muted)]">Email</span>
                    <Input
                      {...register('email', { required: 'Email is required' })}
                      type="email"
                      placeholder="admin@wearewithyou.org"
                    />
                    {errors.email ? <span className="text-[10px] font-medium text-rose-500">{errors.email.message}</span> : null}
                  </div>
                  <div className="space-y-1.5">
                    <span className="caption text-[var(--text-muted)]">Username</span>
                    <Input
                      {...register('username', { required: 'Username is required' })}
                      placeholder="jdoe"
                    />
                    {errors.username ? <span className="text-[10px] font-medium text-rose-500">{errors.username.message}</span> : null}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <span className="caption text-[var(--text-muted)]">First name</span>
                    <Input
                      {...register('firstName', { required: 'First name is required' })}
                      placeholder="Jane"
                    />
                    {errors.firstName ? <span className="text-[10px] font-medium text-rose-500">{errors.firstName.message}</span> : null}
                  </div>
                  <div className="space-y-1.5">
                    <span className="caption text-[var(--text-muted)]">Last name</span>
                    <Input
                      {...register('lastName', { required: 'Last name is required' })}
                      placeholder="Doe"
                    />
                    {errors.lastName ? <span className="text-[10px] font-medium text-rose-500">{errors.lastName.message}</span> : null}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <span className="caption text-[var(--text-muted)]">Password</span>
                    <Input
                      {...register('password', {
                        required: selectedUser ? false : 'Password is required',
                        minLength: selectedUser
                          ? undefined
                          : { value: 8, message: 'Password must be at least 8 characters' },
                      })}
                      type="password"
                      placeholder={selectedUser ? 'Leave blank to keep current' : 'Create strong password'}
                    />
                    {errors.password ? <span className="text-[10px] font-medium text-rose-500">{errors.password.message}</span> : null}
                  </div>
                  <div className="space-y-1.5">
                    <span className="caption text-[var(--text-muted)]">Status</span>
                    <Select
                      {...register('status')}
                      options={[
                        { value: 'Active', label: 'Active' },
                        { value: 'Inactive', label: 'Inactive' },
                        { value: 'Banned', label: 'Banned' },
                      ]}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <span className="caption text-[var(--text-muted)]">Role</span>
                    <Select
                      {...register('role')}
                      options={[
                        { value: 'USER', label: 'User' },
                        { value: 'ADMIN', label: 'Admin' },
                        { value: 'EDITOR', label: 'Editor' },
                      ]}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="caption text-[var(--text-muted)]">Type</span>
                    <Select
                      {...register('type')}
                      options={[
                        { value: 'SEEKER', label: 'Seeker' },
                        { value: 'PROVIDER', label: 'Therapist' },
                      ]}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="caption text-[var(--text-muted)]">Region</span>
                    <Select
                      {...register('region')}
                      options={[
                        { value: 'MENA', label: 'MENA' },
                        { value: 'EMEA', label: 'EMEA' },
                        { value: 'APAC', label: 'APAC' },
                        { value: 'AMER', label: 'AMER' },
                      ]}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={closeUserDialog}>
                    Cancel
                  </Button>
                  <Button type="submit" loading={isSubmitting || createMutation.isPending || updateMutation.isPending}>
                    <Save className="h-4 w-4" />
                    {selectedUser ? 'Save changes' : 'Create user'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
