'use client';

import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Edit2,
  ExternalLink,
  Plus,
  Radio,
  Save,
  Search,
  Stethoscope,
  Trash2,
  User as UserIcon,
  XCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { doctorService } from '@/services/doctor.service';
import {
  sessionsService,
  type ClinicalSession,
  type SessionPayload,
  type SessionStatus,
} from '@/services/sessions.service';
import { userService } from '@/services/user.service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EmptyState, SectionCard, SegmentedControl, StatCard } from '@/components/ui/workspace';
import { DataTable, type Column } from '@/components/ui/data-table';
import { resolveMediaUrl } from '@/lib/media-url';

const STATUS_OPTIONS: { value: SessionStatus; label: string }[] = [
  { value: 'Scheduled', label: 'Scheduled' },
  { value: 'Live', label: 'Live' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
];

const SESSION_TYPE_OPTIONS = [
  { value: 'Individual', label: 'Individual' },
  { value: 'Group', label: 'Group' },
  { value: 'Couple', label: 'Couple' },
  { value: 'Video', label: 'Video' },
  { value: 'Consultation', label: 'Consultation' },
  { value: 'Podcast', label: 'Podcast' },
];

const statusTone = (value: string) => {
  if (value === 'Scheduled') return 'default' as const;
  if (value === 'Live') return 'warning' as const;
  if (value === 'Completed') return 'success' as const;
  if (value === 'Cancelled') return 'danger' as const;
  return 'muted' as const;
};

const emptyForm = (): SessionPayload & { id?: string } => ({
  doctorId: '',
  patientId: '',
  patientName: '',
  startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  sessionType: 'Individual',
  status: 'Scheduled',
  price: 0,
  videoUrl: '',
  audioUrl: '',
});

function getDoctorName(doctor: ClinicalSession['doctor']) {
  const fromUser = `${doctor?.user?.firstName ?? ''} ${doctor?.user?.lastName ?? ''}`.trim();
  return fromUser || doctor?.name || 'Unknown doctor';
}

function getDoctorImage(doctor: ClinicalSession['doctor']) {
  return resolveMediaUrl(doctor?.user?.avatar);
}

function getPatientLabel(session: ClinicalSession) {
  return (
    session.patientName ||
    `${session.patient?.firstName ?? ''} ${session.patient?.lastName ?? ''}`.trim() ||
    'Unknown patient'
  );
}

export function SessionsPanel() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editorOpen, setEditorOpen] = useState(false);
  const [viewSession, setViewSession] = useState<ClinicalSession | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [formError, setFormError] = useState<string | null>(null);

  const { data: sessions = [], isLoading, isError, error } = useQuery({
    queryKey: ['sessions', statusFilter],
    queryFn: () =>
      sessionsService.getAll({
        status: statusFilter !== 'all' ? statusFilter : undefined,
      }),
  });

  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors-list'],
    queryFn: () => doctorService.getAll(),
  });

  const { data: patients = [] } = useQuery({
    queryKey: ['patients-list'],
    queryFn: async () => {
      const result = await userService.getUsers({ type: 'SEEKER', limit: 200 });
      return result.data ?? [];
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['sessions'] });

  const createMutation = useMutation({
    mutationFn: (payload: SessionPayload) => sessionsService.create(payload),
    onSuccess: () => {
      invalidate();
      setEditorOpen(false);
      setForm(emptyForm());
      setFormError(null);
    },
    onError: (err: Error) => setFormError(err.message || 'Failed to create session'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<SessionPayload> }) =>
      sessionsService.update(id, payload),
    onSuccess: () => {
      invalidate();
      setEditorOpen(false);
      setForm(emptyForm());
      setFormError(null);
    },
    onError: (err: Error) => setFormError(err.message || 'Failed to update session'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => sessionsService.delete(id),
    onSuccess: () => {
      invalidate();
      setViewSession(null);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: SessionStatus }) =>
      sessionsService.updateStatus(id, status),
    onSuccess: invalidate,
  });

  const doctorOptions = useMemo(
    () =>
      doctors.map((d: any) => ({
        value: d.userId || d.user?.id || '',
        label: `Dr. ${d.user?.firstName ?? ''} ${d.user?.lastName ?? ''}`.trim() || d.user?.email || 'Doctor',
      })),
    [doctors],
  );

  const patientOptions = useMemo(
    () =>
      patients.map((p: any) => ({
        value: p.id,
        label: `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() || p.email || p.id,
      })),
    [patients],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter((s) => {
      const doctorName = getDoctorName(s.doctor).toLowerCase();
      const patientName = getPatientLabel(s).toLowerCase();
      return (
        doctorName.includes(q) ||
        patientName.includes(q) ||
        s.sessionType.toLowerCase().includes(q) ||
        s.id.includes(q)
      );
    });
  }, [sessions, search]);

  const stats = useMemo(
    () => ({
      total: sessions.length,
      scheduled: sessions.filter((s) => s.status === 'Scheduled').length,
      live: sessions.filter((s) => s.status === 'Live').length,
      completed: sessions.filter((s) => s.status === 'Completed').length,
      cancelled: sessions.filter((s) => s.status === 'Cancelled').length,
    }),
    [sessions],
  );

  const openCreate = () => {
    setForm(emptyForm());
    setFormError(null);
    setEditorOpen(true);
  };

  const openEdit = (session: ClinicalSession) => {
    setForm({
      id: session.id,
      doctorId: session.doctorId,
      patientId: session.patientId,
      patientName: session.patientName,
      startTime: format(new Date(session.startTime), "yyyy-MM-dd'T'HH:mm"),
      sessionType: session.sessionType,
      status: session.status,
      price: session.price,
      videoUrl: session.videoUrl ?? '',
      audioUrl: session.audioUrl ?? '',
    });
    setFormError(null);
    setEditorOpen(true);
  };

  const handleSave = () => {
    setFormError(null);
    if (!form.doctorId) {
      setFormError('Select a doctor.');
      return;
    }
    if (!form.patientId) {
      setFormError('Select a patient.');
      return;
    }
    if (!form.startTime) {
      setFormError('Scheduled time is required.');
      return;
    }

    const payload: SessionPayload = {
      doctorId: form.doctorId,
      patientId: form.patientId,
      startTime: new Date(form.startTime).toISOString(),
      sessionType: form.sessionType,
      status: form.status,
      price: Number(form.price) || 0,
      patientName: form.patientName?.trim() || undefined,
      videoUrl: form.videoUrl?.trim() || null,
      audioUrl: form.audioUrl?.trim() || null,
    };

    if (form.id) {
      updateMutation.mutate({ id: form.id, payload });
      return;
    }
    createMutation.mutate(payload);
  };

  const handleDelete = (session: ClinicalSession) => {
    if (confirm(`Delete session #${session.id}? This cannot be undone.`)) {
      deleteMutation.mutate(session.id);
    }
  };

  const columns = useMemo<Column<ClinicalSession>[]>(
    () => [
      {
        header: 'Doctor',
        accessorKey: 'doctor',
        cell: (row) => {
          const doctorImage = getDoctorImage(row.doctor);
          return (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-sky-100 text-sky-600 dark:bg-sky-950/40 dark:text-sky-300">
                {doctorImage ? (
                  <img src={doctorImage} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Stethoscope className="h-4 w-4" />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-[var(--text-primary)]">Dr. {getDoctorName(row.doctor)}</p>
                <p className="text-xs text-[var(--text-muted)]">{row.doctor?.specialty || '—'}</p>
              </div>
            </div>
          );
        },
      },
      {
        header: 'Patient',
        accessorKey: 'patient',
        cell: (row) => (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--surface-muted)]">
              {row.patient?.avatar ? (
                <img src={resolveMediaUrl(row.patient.avatar)} alt="" className="h-full w-full object-cover" />
              ) : (
                <UserIcon className="h-4 w-4 text-[var(--text-muted)]" />
              )}
            </div>
            <p className="font-medium text-[var(--text-primary)]">{getPatientLabel(row)}</p>
          </div>
        ),
      },
      {
        header: 'Schedule',
        accessorKey: 'startTime',
        cell: (row) => (
          <div className="text-sm">
            <p className="font-medium">{format(new Date(row.startTime), 'MMM d, yyyy')}</p>
            <p className="text-xs text-[var(--text-muted)]">{format(new Date(row.startTime), 'p')}</p>
          </div>
        ),
      },
      {
        header: 'Type',
        accessorKey: 'sessionType',
        cell: (row) => <Badge variant="muted">{row.sessionType}</Badge>,
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: (row) => <Badge variant={statusTone(row.status)}>{row.status}</Badge>,
      },
      {
        header: 'Price',
        accessorKey: 'price',
        cell: (row) => <span className="text-sm tabular-nums">{row.price.toFixed(2)}</span>,
      },
      {
        header: 'Actions',
        accessorKey: 'id',
        className: 'text-right',
        cell: (row) => (
          <div className="flex flex-wrap justify-end gap-1">
            <Button size="sm" variant="ghost" onClick={() => setViewSession(row)}>
              View
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(row)}>
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDelete(row)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total sessions" value={stats.total} icon={Calendar} tone="brand" />
        <StatCard label="Scheduled" value={stats.scheduled} icon={Clock} tone="neutral" />
        <StatCard label="Live" value={stats.live} icon={Radio} tone="warning" />
        <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} tone="success" />
        <StatCard label="Cancelled" value={stats.cancelled} icon={XCircle} tone="danger" />
      </section>

      <SectionCard
        title="Session directory"
        description="Full admin control: create, edit, reschedule, change status, or remove clinical sessions."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            New session
          </Button>
        }
      >
        {isError ? (
          <div className="mb-4 rounded-[var(--radius-md)] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
            {String((error as Error)?.message || 'Failed to load sessions.')}
          </div>
        ) : null}

        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search doctor, patient, type..."
              className="pl-10"
            />
          </div>
          <SegmentedControl
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'All' },
              { value: 'Scheduled', label: 'Scheduled' },
              { value: 'Live', label: 'Live' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Cancelled', label: 'Cancelled' },
            ]}
          />
        </div>

        <DataTable
          data={filtered}
          columns={columns}
          pageSize={10}
          isLoading={isLoading}
          searchPlaceholder="Filter visible rows..."
          emptyState={
            <EmptyState
              title="No sessions found"
              description="Create a session or adjust filters."
              icon={Calendar}
              action={
                <Button onClick={openCreate}>
                  <Plus className="h-4 w-4" />
                  New session
                </Button>
              }
            />
          }
        />
      </SectionCard>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? 'Edit session' : 'New clinical session'}</DialogTitle>
            <DialogDescription>Assign doctor and patient, set schedule, type, status, and optional links.</DialogDescription>
          </DialogHeader>

          {formError ? (
            <div className="rounded-[var(--radius-md)] border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {formError}
            </div>
          ) : null}

          <div className="grid gap-4 py-2">
            <label className="space-y-2 text-sm">
              <span className="text-[var(--text-secondary)]">Doctor</span>
              <Select
                value={form.doctorId}
                onChange={(e) => setForm((f) => ({ ...f, doctorId: e.target.value }))}
                options={[{ value: '', label: 'Select doctor…' }, ...doctorOptions]}
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-[var(--text-secondary)]">Patient</span>
              <Select
                value={form.patientId}
                onChange={(e) => setForm((f) => ({ ...f, patientId: e.target.value }))}
                options={[{ value: '', label: 'Select patient…' }, ...patientOptions]}
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-[var(--text-secondary)]">Patient display name (optional)</span>
              <Input
                value={form.patientName ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, patientName: e.target.value }))}
                placeholder="Override name on session card"
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-[var(--text-secondary)]">Scheduled at</span>
              <Input
                type="datetime-local"
                value={form.startTime}
                onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="text-[var(--text-secondary)]">Session type</span>
                <Select
                  value={form.sessionType ?? 'Individual'}
                  onChange={(e) => setForm((f) => ({ ...f, sessionType: e.target.value }))}
                  options={SESSION_TYPE_OPTIONS}
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="text-[var(--text-secondary)]">Status</span>
                <Select
                  value={form.status ?? 'Scheduled'}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as SessionStatus }))}
                  options={STATUS_OPTIONS}
                />
              </label>
            </div>

            <label className="space-y-2 text-sm">
              <span className="text-[var(--text-secondary)]">Price</span>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={form.price ?? 0}
                onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-[var(--text-secondary)]">Video URL (optional)</span>
              <Input
                value={form.videoUrl ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
                placeholder="https://..."
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-[var(--text-secondary)]">Audio URL (optional)</span>
              <Input
                value={form.audioUrl ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, audioUrl: e.target.value }))}
                placeholder="https://..."
              />
            </label>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setEditorOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              loading={createMutation.isPending || updateMutation.isPending}
            >
              <Save className="h-4 w-4" />
              Save session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewSession} onOpenChange={(open) => !open && setViewSession(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Session #{viewSession?.id}</DialogTitle>
            <DialogDescription>Quick review and status controls.</DialogDescription>
          </DialogHeader>

          {viewSession ? (
            <div className="space-y-4 text-sm">
              <div className="grid gap-2 rounded-[var(--radius-md)] border border-[var(--border)] p-3">
                <p>
                  <span className="text-[var(--text-muted)]">Doctor: </span>
                  Dr. {getDoctorName(viewSession.doctor)}
                </p>
                <p>
                  <span className="text-[var(--text-muted)]">Patient: </span>
                  {getPatientLabel(viewSession)}
                </p>
                <p>
                  <span className="text-[var(--text-muted)]">When: </span>
                  {format(new Date(viewSession.startTime), 'PPpp')}
                </p>
                <p>
                  <span className="text-[var(--text-muted)]">Type: </span>
                  {viewSession.sessionType}
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-[var(--text-muted)]">Status: </span>
                  <Badge variant={statusTone(viewSession.status)}>{viewSession.status}</Badge>
                </p>
                <p>
                  <span className="text-[var(--text-muted)]">Price: </span>
                  {viewSession.price.toFixed(2)}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    size="sm"
                    variant={viewSession.status === opt.value ? 'default' : 'outline'}
                    loading={statusMutation.isPending}
                    onClick={() => statusMutation.mutate({ id: viewSession.id, status: opt.value })}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>

              {viewSession.videoUrl ? (
                <a
                  href={resolveMediaUrl(viewSession.videoUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[var(--accent-strong)]"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open video link
                </a>
              ) : null}
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => viewSession && openEdit(viewSession)}>
              <Edit2 className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="danger" loading={deleteMutation.isPending} onClick={() => viewSession && handleDelete(viewSession)}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
