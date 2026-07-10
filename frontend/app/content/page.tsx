'use client';

import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  Edit2,
  ExternalLink,
  Link as LinkIcon,
  Plus,
  Save,
  Search,
  Trash2,
  Upload,
  Video,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { contentService } from '@/services/content.service';
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
import { EmptyState, PageIntro, SectionCard, SegmentedControl, StatCard } from '@/components/ui/workspace';
import { DataTable, type Column } from '@/components/ui/data-table';

type LibraryFormValues = {
  title: string;
  category: 'Article' | 'Video';
  content: string;
  url: string;
  coverImageUrl: string;
};

const typeIcons: Record<string, React.ElementType> = {
  Article: BookOpen,
  Video,
};

const typeTone: Record<string, 'default' | 'success'> = {
  Article: 'default',
  Video: 'success',
};

export default function ContentLibraryPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [resourceFile, setResourceFile] = useState<File | null>(null);

  const form = useForm<LibraryFormValues>({
    defaultValues: {
      title: '',
      category: 'Article',
      content: '',
      url: '',
      coverImageUrl: '',
    },
  });

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['content-library', search, type],
    queryFn: () =>
      contentService.getAll({
        search: search || undefined,
        category: type !== 'all' ? type : undefined,
        limit: 50,
      }),
  });

  const items = ((data as any)?.data?.data ?? (data as any)?.data ?? []) as any[];

  const createMutation = useMutation({
    mutationFn: (payload: LibraryFormValues) =>
      contentService.create({ ...payload, file: resourceFile, url: payload.url }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-library'], exact: false });
      setResourceFile(null);
      closeEditor();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
      existingType,
    }: {
      id: string;
      payload: LibraryFormValues;
      existingType?: number;
    }) =>
      contentService.update(id, {
        ...payload,
        file: resourceFile,
        url: payload.url,
        existingType,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-library'], exact: false });
      setResourceFile(null);
      closeEditor();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contentService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['content-library'], exact: false }),
  });

  const stats = useMemo(() => {
    return {
      total: items.length,
      articles: items.filter((item: any) => item.category === 'Article').length,
      videos: items.filter((item: any) => item.category === 'Video').length,
    };
  }, [items]);

  const openEditor = (item?: any) => {
    if (item) {
      reset({
        title: item.title || '',
        category: item.category || 'Article',
        content: item.content || '',
        url: item.url || '',
        coverImageUrl: item.coverImageUrl || '',
      });
      setSelectedItem(item);
    } else {
      reset({
        title: '',
        category: 'Article',
        content: '',
        url: '',
        coverImageUrl: '',
      });
      setSelectedItem(null);
    }
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setSelectedItem(null);
    setResourceFile(null);
    reset({
      title: '',
      category: 'Article',
      content: '',
      url: '',
      coverImageUrl: '',
    });
  };

  const saveItem = async (values: LibraryFormValues) => {
    if (selectedItem) {
      await updateMutation.mutateAsync({
        id: selectedItem.id,
        payload: values,
        existingType: selectedItem.resourceType,
      });
      return;
    }
    await createMutation.mutateAsync(values);
  };

  const removeItem = (id: string) => {
    if (confirm('Delete this library item?')) {
      deleteMutation.mutate(id);
    }
  };

  const columns = useMemo<Column<any>[]>(() => [
    {
      header: 'Item',
      accessorKey: 'title',
      cell: (row) => {
        const Icon = typeIcons[row.category] || BookOpen;
        return (
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--surface-muted)] text-[var(--text-secondary)]">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium text-[var(--text-primary)]">{row.title}</p>
              <p className="line-clamp-1 text-xs text-[var(--text-muted)]">{row.content || row.url || 'No description'}</p>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Type',
      accessorKey: 'category',
      cell: (row) => <Badge variant={typeTone[row.category] || 'muted'}>{row.category || 'Article'}</Badge>,
    },
    {
      header: 'Link',
      accessorKey: 'url',
      cell: (row) =>
        row.url ? (
          <a
            href={row.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-[var(--accent-strong)]"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open
          </a>
        ) : (
          <span className="text-sm text-[var(--text-muted)]">Internal</span>
        ),
    },
    {
      header: 'Updated',
      accessorKey: 'updatedAt',
      cell: (row) => <span className="text-xs text-[var(--text-muted)]">{new Date(row.updatedAt || row.createdAt).toLocaleDateString()}</span>,
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      className: 'text-right',
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEditor(row)}>
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => removeItem(row.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ], [deleteMutation]);

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="mx-auto w-full max-w-[1240px] space-y-6">
          <PageIntro
            eyebrow="Content Library"
            title="Articles and media in one place"
            description="Manage articles (text or PDF), videos, and external resources from a single library."
            actions={
              <Button onClick={() => openEditor()}>
                <Plus className="h-4 w-4" />
                New item
              </Button>
            }
          />

          <section className="grid gap-4 md:grid-cols-3">
            <StatCard label="Total items" value={stats.total} icon={BookOpen} tone="brand" />
            <StatCard label="Articles" value={stats.articles} icon={BookOpen} tone="neutral" />
            <StatCard label="Videos" value={stats.videos} icon={Video} tone="success" />
          </section>

          <SectionCard title="Library directory" description="Filter by content type, search by title or description, then edit without jumping between pages.">
            {isError ? (
              <div className="mb-5 rounded-[22px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-300/20 dark:bg-rose-400/10 dark:text-rose-100">
                {String((error as any)?.message || 'Failed to load library items.')}
              </div>
            ) : null}
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search library..."
                  className="pl-10"
                />
              </div>
              <SegmentedControl
                value={type}
                onChange={setType}
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'Article', label: 'Articles' },
                  { value: 'Video', label: 'Videos' },
                ]}
              />
            </div>

            <DataTable
              data={items}
              columns={columns}
              pageSize={10}
              isLoading={isLoading}
              searchPlaceholder="Search visible items..."
              emptyState={
                <EmptyState
                  title="No library items"
                  description="Create the first article or video resource."
                  icon={BookOpen}
                />
              }
            />
          </SectionCard>

          <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedItem ? 'Edit library item' : 'New library item'}</DialogTitle>
                <DialogDescription>
                  Upload a PDF under Article — it is stored as PDF for the mobile app. Text-only articles stay as articles.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit(saveItem)} className="space-y-5">
                <label className="space-y-2 text-sm text-[var(--text-secondary)]">
                  <span>Title</span>
                  <Input {...register('title', { required: true })} placeholder="Stress management guide" />
                  {errors.title ? <span className="text-xs text-rose-500">Title is required.</span> : null}
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm text-[var(--text-secondary)]">
                    <span>Type</span>
                    <select
                      {...register('category')}
                      className="h-11 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] px-3 text-sm text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--border-focus)]"
                    >
                      <option value="Article">Article (text or PDF)</option>
                      <option value="Video">Video</option>
                    </select>
                  </label>

                  <label className="space-y-2 text-sm text-[var(--text-secondary)]">
                    <span>URL</span>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                      <Input {...register('url')} placeholder="/uploads/resource.pdf" className="pl-10" />
                    </div>
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-[var(--text-secondary)]">Resource File</span>
                    <label className="flex h-11 cursor-pointer items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] px-3 text-sm text-[var(--text-secondary)] transition hover:border-[var(--border-strong)]">
                      <span className="min-w-0 truncate">{resourceFile ? resourceFile.name : 'Choose file...'}</span>
                      <Upload className="h-4 w-4 shrink-0" />
                      <input
                        type="file"
                        accept="application/pdf,video/mp4"
                        className="sr-only"
                        onChange={(e) => setResourceFile(e.target.files?.[0] ?? null)}
                      />
                    </label>
                  </div>
                  <label className="space-y-2 text-sm text-[var(--text-secondary)]">
                    <span>Cover URL</span>
                    <Input {...register('coverImageUrl')} placeholder="/uploads/cover.jpg" />
                  </label>
                </div>

                <label className="space-y-2 text-sm text-[var(--text-secondary)]">
                  <span>Description or article body</span>
                  <textarea
                    {...register('content', { required: true })}
                    rows={7}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-3 text-sm text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--border-focus)]"
                    placeholder="Write the article text, or describe an attached PDF..."
                  />
                  {errors.content ? <span className="text-xs text-rose-500">Description is required.</span> : null}
                </label>

                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={closeEditor}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}>
                    <Save className="h-4 w-4" />
                    Save item
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
