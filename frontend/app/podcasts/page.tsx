'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  AlertCircle,
  Calendar,
  Clock,
  Edit2,
  FileAudio,
  Headphones,
  ImagePlus,
  Mic,
  Pause,
  Play,
  Plus,
  Radio,
  Save,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { apiService } from '@/services/api.service';
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
import { Input } from '@/components/ui/input';
import { PodcastCover } from '@/components/podcasts/podcast-cover';
import { EmptyState, PageIntro, SectionCard, StatCard } from '@/components/ui/workspace';
import { resolveMediaUrl } from '@/lib/media-url';
import { cn } from '@/lib/utils';

type Podcast = {
  Id: string | number;
  Title: string;
  Description?: string | null;
  AudioUrl?: string | null;
  CoverImageUrl?: string | null;
  DurationInSeconds?: number | null;
  PublishDate: string;
  IsPublished: boolean;
  Source?: 'DoctorSession' | string;
};

type PodcastFormValues = {
  title: string;
  description: string;
  audioUrl: string;
  coverImageUrl: string;
  duration: string;
  publishDate: string;
  isPublished: boolean;
};

function formatDuration(seconds?: number | null) {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function isDirectAudioUrl(url?: string | null) {
  const normalized = url?.trim() || '';
  if (!normalized) return false;
  if (normalized.startsWith('/uploads/podcasts/audio/')) return true;
  try {
    const parsed = new URL(normalized, 'http://local.test');
    return /\.(mp3|m4a|aac|wav|ogg|oga|webm)(\?.*)?$/i.test(parsed.pathname + parsed.search);
  } catch {
    return false;
  }
}

function buildPodcastFormData(values: PodcastFormValues, audioFile: File | null, coverFile: File | null) {
  const fd = new FormData();
  fd.append('title', values.title.trim());
  fd.append('description', values.description.trim());
  fd.append('audioUrl', values.audioUrl.trim());
  fd.append('coverImageUrl', values.coverImageUrl.trim());
  fd.append('duration', values.duration || '0');
  fd.append('publishDate', values.publishDate);
  fd.append('isPublished', String(values.isPublished));
  if (audioFile) fd.append('audio', audioFile);
  if (coverFile) fd.append('cover', coverFile);
  return fd;
}

export default function PodcastsPage() {
  const queryClient = useQueryClient();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [search, setSearch] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const [activePodcast, setActivePodcast] = useState<Podcast | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playerDuration, setPlayerDuration] = useState(0);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [playerError, setPlayerError] = useState<string | null>(null);

  const {
    reset,
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<PodcastFormValues>({
    defaultValues: {
      title: '',
      description: '',
      audioUrl: '',
      coverImageUrl: '',
      duration: '',
      publishDate: format(new Date(), 'yyyy-MM-dd'),
      isPublished: true,
    },
  });

  const { data: podcasts = [], isLoading } = useQuery({
    queryKey: ['podcasts'],
    queryFn: async () => {
      const response = await apiService.get<any[]>('/Podcasts');
      return response.data.map((item: any) => ({
        Id: item.id,
        Title: item.title || 'Untitled Episode',
        Description: item.description || '',
        AudioUrl: item.fileUrl || null,
        CoverImageUrl: item.coverImageUrl || '',
        DurationInSeconds: (item.duration || 0) * 60,
        PublishDate: item.createdAt || new Date().toISOString(),
        IsPublished: true,
        Source: item.fileName || 'Upload',
      }));
    },
  });

  const createMutation = useMutation({
    mutationFn: async ({ values, audio, cover }: { values: PodcastFormValues; audio: File | null; cover: File | null }) => {
      const fd = new FormData();
      fd.append('Title', values.title.trim());
      fd.append('Description', values.description.trim());
      fd.append('CoverImageUrl', values.coverImageUrl.trim() || '/uploads/default-cover.jpg');
      fd.append('Duration', String(Number(values.duration) || 0));
      fd.append('IsPublished', 'true');
      if (audio) {
        fd.append('File', audio);
      } else {
        const blob = new Blob([''], { type: 'audio/mpeg' });
        fd.append('File', blob, 'empty.mp3');
      }
      return apiService.postMultipart('/Podcasts', fd);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['podcasts'] });
      setEditorOpen(false);
      setAudioFile(null);
      setCoverFile(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      values,
      audio,
      cover,
    }: {
      id: string | number;
      values: PodcastFormValues;
      audio: File | null;
      cover: File | null;
    }) => {
      // Backend does not support PUT, so we delete old one and create new one
      try {
        await apiService.delete(`/Podcasts/${id}`);
      } catch (err) {
        console.warn('Failed to delete old podcast before update:', err);
      }
      
      const fd = new FormData();
      fd.append('Title', values.title.trim());
      fd.append('Description', values.description.trim());
      fd.append('CoverImageUrl', values.coverImageUrl.trim() || '/uploads/default-cover.jpg');
      fd.append('Duration', String(Number(values.duration) || 0));
      fd.append('IsPublished', 'true');
      if (audio) {
        fd.append('File', audio);
      } else {
        const blob = new Blob([''], { type: 'audio/mpeg' });
        fd.append('File', blob, 'empty.mp3');
      }
      return apiService.postMultipart('/Podcasts', fd);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['podcasts'] });
      setEditorOpen(false);
      setAudioFile(null);
      setCoverFile(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => apiService.delete(`/Podcasts/${id}`),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['podcasts'] });
      if (activePodcast?.Id === id) {
        audioRef.current?.pause();
        setActivePodcast(null);
      }
    },
  });

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !activePodcast) return;
    audio.src = resolveMediaUrl(activePodcast.AudioUrl);
    setPlayerError(null);
    setProgress(0);
    setCurrentTime(0);
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    }
  }, [activePodcast, isPlaying]);

  const filteredPodcasts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return podcasts;
    return podcasts.filter((p) =>
      [p.Title, p.Description, p.Source]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [podcasts, search]);

  const playableCount = podcasts.filter((p) => !!p.AudioUrl).length;
  const totalMinutes = podcasts.reduce((sum, p) => sum + Math.round((p.DurationInSeconds || 0) / 60), 0);

  const openEditor = (podcast?: Podcast) => {
    setFormError(null);
    setAudioFile(null);
    setCoverFile(null);
    if (podcast) {
      reset({
        title: podcast.Title || '',
        description: podcast.Description || '',
        audioUrl: podcast.AudioUrl || '',
        coverImageUrl: podcast.CoverImageUrl || '',
        duration: String(Math.round((podcast.DurationInSeconds || 0) / 60) || ''),
        publishDate: format(new Date(podcast.PublishDate), 'yyyy-MM-dd'),
        isPublished: podcast.IsPublished,
      });
      setSelectedPodcast(podcast);
    } else {
      reset({
        title: '',
        description: '',
        audioUrl: '',
        coverImageUrl: '',
        duration: '',
        publishDate: format(new Date(), 'yyyy-MM-dd'),
        isPublished: true,
      });
      setSelectedPodcast(null);
    }
    setEditorOpen(true);
  };

  const handleSave = async (values: PodcastFormValues) => {
    setFormError(null);
    
    if (selectedPodcast) {
      if (!audioFile) {
        setFormError('To edit this episode, please upload/re-select the audio file. The server requires re-uploading the media when making updates.');
        return;
      }
      await updateMutation.mutateAsync({ id: selectedPodcast.Id, values, audio: audioFile, cover: coverFile });
      return;
    }

    if (!audioFile) {
      setFormError('Please choose or drag an audio file to upload.');
      return;
    }

    await createMutation.mutateAsync({ values, audio: audioFile, cover: coverFile });
  };

  const handleDelete = (podcast: Podcast) => {
    if (confirm(`Delete "${podcast.Title}"?`)) {
      deleteMutation.mutate(podcast.Id);
    }
  };

  const togglePlay = (podcast: Podcast) => {
    if (!podcast.AudioUrl) {
      openEditor(podcast);
      setFormError('This episode does not have an audio file yet. Add a file or URL to make it playable.');
      return;
    }

    if (activePodcast?.Id === podcast.Id) {
      setPlayerError(null);
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
      return;
    }

    setActivePodcast(podcast);
    setPlayerError(null);
    setIsPlaying(true);
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6 pb-28">
          <PageIntro
            eyebrow="Content Management"
            title="Podcast Episodes"
            description="Upload podcast files, edit episode details, control publishing, and listen from one workspace."
            actions={
              <Button onClick={() => openEditor()}>
                <Plus className="h-4 w-4" />
                Add Episode
              </Button>
            }
          />

          <section className="grid gap-4 md:grid-cols-4">
            <StatCard label="Total Episodes" value={podcasts.length} icon={Mic} tone="brand" />
            <StatCard label="Playable" value={playableCount} icon={Headphones} tone="success" />
            <StatCard label="Published" value={podcasts.filter((p) => p.IsPublished).length} icon={Radio} tone="neutral" />
            <StatCard label="Total Minutes" value={totalMinutes || '0'} icon={Clock} tone="warning" />
          </section>

          <SectionCard
            title="Episode Library"
            description="Search, listen, edit, delete, or add a new podcast file."
            actions={
              <Button variant="outline" onClick={() => openEditor()}>
                <Upload className="h-4 w-4" />
                Upload file
              </Button>
            }
          >
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search episodes..."
                  className="pl-10"
                />
              </div>
              <div className="text-xs font-medium text-[var(--text-tertiary)]">
                {filteredPodcasts.length} shown from {podcasts.length} episodes
              </div>
            </div>

            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-72 rounded-[var(--radius-lg)] bg-[var(--surface-muted)] animate-pulse" />
                ))}
              </div>
            ) : filteredPodcasts.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <AnimatePresence>
                  {filteredPodcasts.map((podcast) => {
                    const active = activePodcast?.Id === podcast.Id;
                    const hasAudio = !!podcast.AudioUrl;
                    return (
                      <motion.article
                        key={podcast.Id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className={cn(
                          'overflow-hidden rounded-[var(--radius-lg)] border bg-[var(--bg-elevated)] shadow-[var(--shadow-sm)] transition',
                          active ? 'border-sky-400/50 ring-2 ring-sky-400/15' : 'border-[var(--border)] hover:border-[var(--border-strong)]',
                        )}
                      >
                        <div className="relative aspect-[16/9] overflow-hidden bg-[var(--surface-muted)]">
                          <PodcastCover
                            coverImageUrl={podcast.CoverImageUrl}
                            alt={podcast.Title}
                            variant="card"
                          />
                          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                            <Badge variant={podcast.IsPublished ? 'success' : 'muted'}>
                              {podcast.IsPublished ? 'Published' : 'Draft'}
                            </Badge>
                            {podcast.Source === 'DoctorSession' ? (
                              <Badge variant="brand">Session</Badge>
                            ) : null}
                          </div>
                          <Button
                            type="button"
                            size="icon"
                            variant="secondary"
                            disabled={!hasAudio}
                            title={hasAudio ? 'Play episode' : 'Add audio before playing'}
                            onClick={() => togglePlay(podcast)}
                            className="absolute bottom-3 right-3 h-12 w-12 rounded-full bg-white/90 text-slate-900 shadow-lg hover:bg-white dark:bg-slate-950/90 dark:text-white"
                          >
                            {active && isPlaying ? (
                              <Pause className="h-5 w-5 fill-current" />
                            ) : (
                              <Play className="h-5 w-5 fill-current" />
                            )}
                          </Button>
                        </div>

                        <div className="space-y-4 p-4">
                          <div className="flex items-center justify-between gap-3 text-xs text-[var(--text-tertiary)]">
                            <span className="inline-flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              {formatDuration(podcast.DurationInSeconds)}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              {format(new Date(podcast.PublishDate), 'MMM d, yyyy')}
                            </span>
                          </div>

                          <div className="min-h-[72px] space-y-1.5">
                            <h3 className="line-clamp-1 text-base font-semibold text-[var(--text-primary)]">
                              {podcast.Title}
                            </h3>
                            <p className="line-clamp-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                              {podcast.Description || 'No description added yet.'}
                            </p>
                          </div>

                          {!hasAudio ? (
                            <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-amber-300/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-200">
                              <AlertCircle className="h-4 w-4" />
                              Add audio to make this episode playable.
                            </div>
                          ) : null}

                          <div className="grid grid-cols-[1fr_auto_auto] gap-2 border-t border-[var(--border)] pt-4">
                            <Button
                              type="button"
                              variant={active && isPlaying ? 'secondary' : 'default'}
                              size="sm"
                              disabled={!hasAudio}
                              onClick={() => togglePlay(podcast)}
                            >
                              {active && isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                              {active && isPlaying ? 'Playing' : 'Listen'}
                            </Button>
                            <Button type="button" variant="outline" size="icon" onClick={() => openEditor(podcast)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="danger"
                              size="icon"
                              loading={deleteMutation.isPending}
                              onClick={() => handleDelete(podcast)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.article>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              <EmptyState
                title="No episodes found"
                description="Add a podcast audio file or adjust your search."
                icon={Mic}
                action={
                  <Button onClick={() => openEditor()}>
                    <Plus className="h-4 w-4" />
                    Add Episode
                  </Button>
                }
              />
            )}
          </SectionCard>

          <AnimatePresence>
            {activePodcast ? (
              <motion.div
                initial={{ y: 120, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 120, opacity: 0 }}
                className="fixed bottom-5 left-4 right-4 z-50 md:left-[344px] md:right-8"
              >
                <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-elevated)] p-4 shadow-[var(--shadow-xl)]">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 overflow-hidden rounded-[var(--radius-md)] bg-[var(--surface-muted)]">
                        <PodcastCover
                          coverImageUrl={activePodcast.CoverImageUrl}
                          alt={activePodcast.Title}
                          variant="thumb"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{activePodcast.Title}</p>
                        <p className="truncate text-xs text-[var(--text-tertiary)]">{activePodcast.Description}</p>
                      </div>
                    </div>

                    <div className="flex flex-1 items-center gap-3">
                      <Button type="button" size="icon" variant="secondary" onClick={() => togglePlay(activePodcast)}>
                        {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
                      </Button>
                      <span className="w-10 text-right text-xs tabular-nums text-[var(--text-tertiary)]">
                        {formatDuration(currentTime)}
                      </span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={progress}
                        onChange={(e) => {
                          const next = Number(e.target.value);
                          setProgress(next);
                          if (audioRef.current && playerDuration) {
                            audioRef.current.currentTime = (next / 100) * playerDuration;
                          }
                        }}
                        className="h-2 flex-1 accent-sky-500"
                      />
                      <span className="w-10 text-xs tabular-nums text-[var(--text-tertiary)]">
                        {formatDuration(playerDuration || activePodcast.DurationInSeconds)}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          audioRef.current?.pause();
                          setActivePodcast(null);
                          setIsPlaying(false);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {playerError ? (
                    <div className="mt-3 flex items-center gap-2 rounded-[var(--radius-md)] border border-rose-300/30 bg-rose-400/10 px-3 py-2 text-xs text-rose-600 dark:text-rose-200">
                      <AlertCircle className="h-4 w-4" />
                      {playerError}
                    </div>
                  ) : null}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <audio
            ref={audioRef}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            onLoadedMetadata={(e) => setPlayerDuration(e.currentTarget.duration || 0)}
            onError={() => {
              setIsPlaying(false);
              const currentAudioUrl = activePodcast?.AudioUrl || '';
              setPlayerError(
                currentAudioUrl && !isDirectAudioUrl(currentAudioUrl)
                  ? 'This episode uses a page link, not a direct audio file. Edit it and paste a direct .mp3, .m4a, .aac, .wav, .ogg, or .webm URL.'
                  : 'Audio file could not be loaded. If this came from the mobile app, set NEXT_PUBLIC_MEDIA_URL to that app media host or edit the episode with the full audio URL.',
              );
            }}
            onTimeUpdate={(e) => {
              const audio = e.currentTarget;
              setCurrentTime(audio.currentTime);
              setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
            }}
            className="hidden"
          />

          <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
            <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto rounded-[var(--radius-lg)]">
              <DialogHeader>
                <DialogTitle>{selectedPodcast ? 'Edit Episode' : 'Add New Episode'}</DialogTitle>
                <DialogDescription>
                  Upload an audio file, paste a direct URL, and optionally add a cover image.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
                {formError ? (
                  <div className="rounded-[var(--radius-md)] border border-rose-300/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-200">
                    {formError}
                  </div>
                ) : null}

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Episode Title</label>
                    <Input {...register('title', { required: true })} placeholder="Episode title" />
                    {errors.title ? <p className="text-xs text-rose-500">Title is required.</p> : null}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Duration (minutes)</label>
                    <Input {...register('duration')} inputMode="numeric" placeholder="45" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Description</label>
                  <textarea
                    {...register('description')}
                    className={cn(
                      'min-h-[100px] w-full resize-y rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] shadow-[var(--shadow-xs)] outline-none focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[var(--border-focus)]/20 dark:bg-white/[0.05]',
                    )}
                    placeholder="Brief summary..."
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Audio File</label>
                    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-3 py-3 text-sm text-[var(--text-secondary)] transition hover:border-[var(--border-strong)]">
                      <span className="min-w-0 truncate">{audioFile ? audioFile.name : 'Choose MP3, WAV, M4A, OGG...'}</span>
                      <Upload className="h-4 w-4 shrink-0" />
                      <input
                        type="file"
                        accept="audio/mpeg,audio/mp3,audio/mp4,audio/aac,audio/wav,audio/ogg,audio/webm"
                        className="sr-only"
                        onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
                      />
                    </label>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Audio URL</label>
                    <Input {...register('audioUrl')} placeholder="https://... or /uploads/..." />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Cover File</label>
                    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-3 py-3 text-sm text-[var(--text-secondary)] transition hover:border-[var(--border-strong)]">
                      <span className="min-w-0 truncate">{coverFile ? coverFile.name : 'Choose cover image...'}</span>
                      <ImagePlus className="h-4 w-4 shrink-0" />
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="sr-only"
                        onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                      />
                    </label>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Cover URL</label>
                    <Input {...register('coverImageUrl')} placeholder="https://... or /uploads/..." />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Publish Date</label>
                    <Input type="date" {...register('publishDate')} />
                  </div>
                  <label className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-3">
                    <input
                      type="checkbox"
                      {...register('isPublished')}
                      className="h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                    />
                    <span className="text-sm font-medium text-[var(--text-secondary)]">Publish episode immediately</span>
                  </label>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditorOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" loading={isSubmitting || createMutation.isPending || updateMutation.isPending}>
                    <Save className="h-4 w-4" />
                    {selectedPodcast ? 'Update Episode' : 'Save Episode'}
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
