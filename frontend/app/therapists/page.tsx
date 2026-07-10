'use client';

import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Edit2,
  Loader2,
  Plus,
  Save,
  Search,
  Stethoscope,
  Trash2,
  UserCheck,
  Users as UsersIcon,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { doctorService } from '@/services/doctor.service';
import { userService } from '@/services/user.service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EmptyState, PageIntro, SectionCard, StatCard } from '@/components/ui/workspace';
import { motion, AnimatePresence } from 'framer-motion';

type DoctorFormValues = {
  userId: string;
  specialty: string;
  bio: string;
  experience: number;
};

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1')
  .replace(/\/api\/v1\/?$/, '')
  .replace(/\/$/, '');
const MEDIA_ORIGIN = (process.env.NEXT_PUBLIC_MEDIA_URL || API_ORIGIN).replace(/\/$/, '');

function resolveMediaUrl(url?: string | null) {
  if (!url) return '';
  const normalized = url.trim();
  if (/^(https?:)?\/\//i.test(normalized) || normalized.startsWith('data:') || normalized.startsWith('blob:')) {
    return normalized;
  }
  const origin =
    normalized.startsWith('/uploads') || normalized.startsWith('/images') ? MEDIA_ORIGIN : API_ORIGIN;
  return `${origin}${normalized.startsWith('/') ? normalized : `/${normalized}`}`;
}

function getDoctorName(doc: any) {
  const fromUser = `${doc.user?.firstName ?? ''} ${doc.user?.lastName ?? ''}`.trim();
  return fromUser || doc.name || doc.fullName || 'Unknown doctor';
}

function getDoctorImage(doc: any) {
  return resolveMediaUrl(doc.imageUrl || doc.ImageUrl || doc.user?.avatar || doc.user?.avatarUrl);
}

function getDoctorSpecialty(doc: any) {
  return doc.specialty || doc.specialization || doc.Specialization || 'General';
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function TherapistsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const { data: doctors = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => doctorService.getAll(),
  });

  const { data: usersResponse } = useQuery({
    queryKey: ['users', 'PROVIDER'],
    queryFn: () => userService.getAll({ type: 'PROVIDER' }),
  });
  const therapistUsers = usersResponse ?? [];

  const editorForm = useForm<DoctorFormValues>({
    defaultValues: {
      userId: '',
      specialty: '',
      bio: '',
      experience: 0,
    },
  });

  const {
    reset,
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = editorForm;

  const openEditor = (doctor?: any) => {
    setMutationError(null);
    if (doctor) {
      reset({
        userId: doctor.userId,
        specialty: doctor.specialty,
        bio: doctor.bio || '',
        experience: doctor.experience || 0,
      });
      setSelectedDoctor(doctor);
    } else {
      reset({
        userId: '',
        specialty: '',
        bio: '',
        experience: 0,
      });
      setSelectedDoctor(null);
    }
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setSelectedDoctor(null);
    setMutationError(null);
  };

  const createMutation = useMutation({
    mutationFn: (data: any) => doctorService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      closeEditor();
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to create therapist profile';
      setMutationError(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => doctorService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      closeEditor();
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to update therapist profile';
      setMutationError(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => doctorService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['doctors'] }),
  });

  const handleSave = async (values: DoctorFormValues) => {
    const payload = {
      ...values,
      experience: Number(values.experience),
    };

    if (selectedDoctor) {
      await updateMutation.mutateAsync({ id: selectedDoctor.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
  };

  const handleRemove = (id: string) => {
    if (confirm('Remove this therapist profile? The user account will remain.')) {
      deleteMutation.mutate(id);
    }
  };

  const filtered = useMemo(() => {
    return doctors.filter((doc: any) => {
      const name = getDoctorName(doc).toLowerCase();
      const email = doc.user?.email?.toLowerCase() || '';
      const specialty = getDoctorSpecialty(doc).toLowerCase();
      const query = search.toLowerCase();
      return name.includes(query) || email.includes(query) || specialty.includes(query);
    });
  }, [doctors, search]);

  return (
    <ProtectedRoute requiredRole={['ADMIN', 'MODERATOR']}>
      <MainLayout>
        <div className="mx-auto w-full max-w-[1240px] space-y-6">
          <PageIntro
            eyebrow="Clinical network"
            title="Therapist management"
            description="Manage therapist profiles, specialties, and clinical backgrounds with full persistence."
            actions={
              <Button onClick={() => openEditor()}>
                <Plus className="h-4 w-4" />
                Add therapist
              </Button>
            }
          />

          <section className="grid gap-4 md:grid-cols-3">
            <StatCard label="Total therapists" value={doctors.length} icon={Stethoscope} tone="brand" />
            <StatCard label="Therapist accounts" value={therapistUsers.length} icon={UserCheck} tone="success" />
            <StatCard label="Specialties" value={new Set(doctors.map((d: any) => getDoctorSpecialty(d))).size} icon={UsersIcon} tone="neutral" />
          </section>

          <SectionCard title="Directory" description="Search and manage professional profiles.">
            <div className="mb-6 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email or specialty..."
                  className="pl-10"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center gap-3 py-16 text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading therapist directory…
              </div>
            ) : null}

            {!isLoading && filtered.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <AnimatePresence>
                  {filtered.map((doc: any, index: number) => {
                    const doctorImage = getDoctorImage(doc);
                    const doctorName = getDoctorName(doc);
                    const doctorSpecialty = getDoctorSpecialty(doc);
                    return (
                    <motion.div
                      key={doc.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group rounded-[24px] border border-slate-200 bg-white/84 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/[0.04]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[18px] bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold">
                            {doctorImage ? (
                              <img src={doctorImage} alt="" className="h-full w-full object-cover" />
                            ) : (
                              getInitials(doctorName)
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-950 dark:text-white">
                              {doctorName}
                            </p>
                            <p className="text-xs text-[var(--accent-strong)] font-medium uppercase tracking-wider">
                              {doctorSpecialty}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEditor(doc)}>
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-500 hover:text-rose-600" onClick={() => handleRemove(doc.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                          {doc.bio || 'No biography provided.'}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-white/5">
                        <div className="flex gap-3">
                          <div className="text-center">
                            <p className="text-[10px] uppercase tracking-wider text-slate-400">Experience</p>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{doc.experience ?? doc.experienceYears ?? 0}y</p>
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] uppercase tracking-wider text-slate-400">Rating</p>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">★ {Number(doc.rating ?? 0).toFixed(1)}</p>
                          </div>
                        </div>
                        <Badge variant="muted">{doc.user?.email}</Badge>
                      </div>
                    </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : !isLoading ? (
              <EmptyState
                title="No therapists found"
                description="Create a profile for an existing therapist account."
                icon={Stethoscope}
              />
            ) : null}
          </SectionCard>

          <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{selectedDoctor ? 'Edit therapist profile' : 'Add therapist profile'}</DialogTitle>
                <DialogDescription>
                  Professional background for platform therapists.
                </DialogDescription>
              </DialogHeader>

              {mutationError ? (
                <div className="rounded-[16px] border border-rose-200/50 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-400/15 dark:bg-rose-400/10 dark:text-rose-200">
                  {mutationError}
                </div>
              ) : null}

              <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
                <div className="space-y-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Therapist account</span>
                  <select
                    {...register('userId', { required: 'Please select a user' })}
                    disabled={!!selectedDoctor}
                    className="h-11 w-full rounded-[16px] border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[rgba(49,94,251,0.3)] dark:border-white/10 dark:bg-white/[0.06] dark:text-white"
                  >
                    <option value="">Select a therapist...</option>
                    {therapistUsers.map((u: any) => (
                      <option key={u.id} value={u.id}>
                        {u.firstName} {u.lastName} ({u.email})
                      </option>
                    ))}
                  </select>
                  {errors.userId ? <span className="text-xs text-rose-500">{errors.userId.message}</span> : null}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Specialty</span>
                    <Input {...register('specialty', { required: 'Specialty is required' })} placeholder="e.g. Cardiology" />
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Experience (Years)</span>
                    <Input type="number" {...register('experience', { required: true, min: 0 })} />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Biography</span>
                  <textarea
                    {...register('bio')}
                    rows={4}
                    className="w-full rounded-[20px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[rgba(49,94,251,0.3)] dark:border-white/10 dark:bg-white/[0.06] dark:text-white"
                    placeholder="Describe the professional background..."
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={closeEditor}>
                    Cancel
                  </Button>
                  <Button type="submit" loading={isSubmitting || createMutation.isPending || updateMutation.isPending}>
                    <Save className="h-4 w-4" />
                    {selectedDoctor ? 'Save changes' : 'Create profile'}
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
