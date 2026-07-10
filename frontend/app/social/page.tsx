'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  Eye,
  ImagePlus,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Share2,
  ThumbsUp,
  Trash2,
  User as UserIcon,
  UserX,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { apiService } from '@/services/api.service';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmptyState, PageIntro, SectionCard, StatCard } from '@/components/ui/workspace';
import { DataTable, type Column } from '@/components/ui/data-table';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  getSocialPostImageFallback,
  getSocialPostImageSrc,
  resolveMediaUrl,
} from '@/lib/media-url';

function invalidateSocialQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['social-feed'] });
  queryClient.invalidateQueries({ queryKey: ['social-feed-dashboard'] });
}

function MissingImage() {
  return (
    <div className="flex h-full w-full items-center justify-center gap-1.5 bg-[var(--surface-muted)] px-2 text-[10px] font-medium text-[var(--text-muted)]">
      <AlertCircle className="h-3.5 w-3.5" />
      Missing image
    </div>
  );
}

export default function SocialModerationPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [viewPost, setViewPost] = useState<any | null>(null);
  const [editPost, setEditPost] = useState<any | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newFile, setNewFile] = useState<File | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['social-feed'],
    queryFn: async () => {
      const response = await apiService.get('/social/feed');
      return response.data?.data || response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) =>
      apiService.post(`/social/posts/${id}/delete`),
    onSuccess: () => invalidateSocialQueries(queryClient),
  });

  const createMutation = useMutation({
    mutationFn: async (payload: {
      content: string;
      imageUrl?: string;
      file?: File | null;
    }) => {
      const { content, imageUrl, file } = payload;
      if (file) {
        const fd = new FormData();
        fd.append('content', content);
        fd.append('image', file);
        if (imageUrl?.trim()) {
          fd.append('imageUrl', imageUrl.trim());
        }
        const res = await apiService.postMultipart('/social/posts/with-media', fd);
        return res.data;
      }
      const res = await apiService.post('/social/posts', {
        content,
        ...(imageUrl?.trim() ? { imageUrl: imageUrl.trim() } : {}),
      });
      return res.data;
    },
    onSuccess: () => {
      invalidateSocialQueries(queryClient);
      setCreateOpen(false);
      setNewContent('');
      setNewImageUrl('');
      setNewFile(null);
      setCreateError(null);
    },
    onError: (err: any) => {
      const raw = err.response?.data?.message;
      const msg = Array.isArray(raw)
        ? raw.join(', ')
        : raw || err.message || 'Failed to publish post.';
      setCreateError(typeof msg === 'string' ? msg : 'Failed to publish post.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      content,
      imageUrl,
    }: {
      id: string | number;
      content: string;
      imageUrl: string | null;
    }) =>
      apiService.put(`/social/posts/${id}`, {
        content,
        imageUrl: imageUrl === '' ? null : imageUrl,
      }),
    onSuccess: () => {
      invalidateSocialQueries(queryClient);
      setEditPost(null);
    },
  });

  const banMutation = useMutation({
    mutationFn: (id: string) => apiService.put(`/users/${id}`, { status: 'Banned', isActive: false }),
    onSuccess: () => invalidateSocialQueries(queryClient),
  });

  const openEdit = useCallback((row: any) => {
    setEditPost(row);
    setEditContent(row.content ?? '');
    setEditImageUrl(row.imageUrl ?? '');
  }, []);

  const filtered = useMemo(() => {
    return posts.filter((p: any) => {
      const authorName = `${p.author?.firstName} ${p.author?.lastName}`.toLowerCase();
      const content = p.content.toLowerCase();
      return authorName.includes(search.toLowerCase()) || content.includes(search.toLowerCase());
    });
  }, [posts, search]);

  const stats = useMemo(() => ({
    total: posts.length,
    engagement: posts.reduce((acc: number, p: any) => acc + (p._count?.likes || 0) + (p._count?.comments || 0), 0),
  }), [posts]);

  const columns = useMemo<Column<any>[]>(() => [
    {
      header: 'Author',
      accessorKey: 'author',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 overflow-hidden">
             {row.author?.avatar ? <img src={resolveMediaUrl(row.author.avatar)} alt="" /> : <UserIcon className="h-4 w-4" />}
          </div>
          <p className="font-medium text-slate-900 dark:text-white">
            {row.author?.firstName} {row.author?.lastName}
          </p>
        </div>
      ),
    },
    {
      header: 'Content',
      accessorKey: 'content',
      cell: (row) => (
        <div className="flex max-w-md flex-col gap-2 py-1">
          <p className="truncate text-sm">{row.content}</p>
          {row.imageUrl && (
            <div className="relative aspect-video w-32 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
              {brokenImages[String(row.id)] ? (
                <MissingImage />
              ) : (
                <img
                  src={getSocialPostImageSrc(row.id, row.imageUrl)}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    const target = event.target as HTMLImageElement;
                    const fallback = getSocialPostImageFallback(row.id, row.imageUrl);
                    if (fallback && target.src !== fallback) {
                      target.src = fallback;
                      return;
                    }
                    setBrokenImages((prev) => ({ ...prev, [String(row.id)]: true }));
                  }}
                />
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Posted At',
      accessorKey: 'createdAt',
      cell: (row) => (
        <p className="text-sm text-slate-500">
          {format(new Date(row.createdAt), 'MMM d, p')}
        </p>
      ),
    },
    {
      header: 'Stats',
      accessorKey: '_count',
      cell: (row) => (
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> {row._count?.likes || 0}</span>
          <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {row._count?.comments || 0}</span>
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
            <DropdownMenuItem onClick={() => setViewPost(row)}>
              <Eye className="mr-2 h-4 w-4" />
              View post
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openEdit(row)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-rose-500"
              onClick={() => {
                if (typeof window !== 'undefined' && window.confirm('Delete this post permanently?')) {
                  deleteMutation.mutate(row.id);
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
            <DropdownMenuItem className="text-rose-600 font-semibold" onClick={() => banMutation.mutate(row.authorId)}>
              <UserX className="mr-2 h-4 w-4" />
              Ban Author
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [deleteMutation, banMutation, openEdit]);

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="mx-auto w-full max-w-[1240px] space-y-6">
          <PageIntro
            eyebrow="Community Management"
            title="Social Content Moderation"
            description="Manage community posts and ensure a safe environment for all users."
            actions={
              <Button
                type="button"
                className="gap-2"
                onClick={() => {
                  setCreateError(null);
                  setCreateOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                New post
              </Button>
            }
          />

          <section className="grid gap-4 md:grid-cols-2">
            <StatCard label="Total Posts" value={stats.total} icon={Share2} tone="brand" />
            <StatCard label="Total Engagement" value={stats.engagement} icon={ThumbsUp} tone="success" />
          </section>

          <SectionCard
            title="Manage posts"
            description="View all posts, open details, edit or delete from the actions menu (⋯)."
          >
            <div className="mb-6 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by author or content..."
                  className="pl-10"
                />
              </div>
            </div>

            <DataTable
              data={filtered}
              columns={columns}
              pageSize={10}
              isLoading={isLoading}
              searchPlaceholder="Filter posts..."
              emptyState={
                <EmptyState
                  title="No posts found"
                  description="Community seems quiet or search terms yielded no results."
                  icon={Share2}
                />
              }
            />
          </SectionCard>

          <Dialog open={!!viewPost} onOpenChange={(open) => !open && setViewPost(null)}>
            <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto rounded-[var(--radius-lg)]">
              <DialogHeader>
                <DialogTitle>Community post</DialogTitle>
                <DialogDescription>
                  {viewPost
                    ? `${viewPost.author?.firstName ?? ''} ${viewPost.author?.lastName ?? ''} · ${format(new Date(viewPost.createdAt), 'PPpp')}`
                    : ''}
                </DialogDescription>
              </DialogHeader>
              {viewPost ? (
                <div className="space-y-4">
                  <p className="whitespace-pre-wrap text-sm text-[var(--text-secondary)]">{viewPost.content}</p>
                  {viewPost.imageUrl ? (
                    <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)]">
                      {brokenImages[`view-${viewPost.id}`] ? (
                        <div className="h-44">
                          <MissingImage />
                        </div>
                      ) : (
                        <img
                          src={getSocialPostImageSrc(viewPost.id, viewPost.imageUrl)}
                          alt=""
                          className="max-h-80 w-full object-contain"
                          onError={(event) => {
                            const target = event.target as HTMLImageElement;
                            const fallback = getSocialPostImageFallback(viewPost.id, viewPost.imageUrl);
                            if (fallback && target.src !== fallback) {
                              target.src = fallback;
                              return;
                            }
                            setBrokenImages((prev) => ({ ...prev, [`view-${viewPost.id}`]: true }));
                          }}
                        />
                      )}
                    </div>
                  ) : null}
                  <div className="flex gap-4 text-xs text-[var(--text-muted)]">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-3.5 w-3.5" /> {viewPost._count?.likes ?? 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" /> {viewPost._count?.comments ?? 0}
                    </span>
                  </div>
                </div>
              ) : null}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setViewPost(null)}>
                  Close
                </Button>
                {viewPost ? (
                  <Button type="button" onClick={() => openEdit(viewPost)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                ) : null}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog
            open={createOpen}
            onOpenChange={(open) => {
              setCreateOpen(open);
              if (!open) {
                setNewContent('');
                setNewImageUrl('');
                setNewFile(null);
                setCreateError(null);
              }
            }}
          >
            <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto rounded-[var(--radius-lg)]">
              <DialogHeader>
                <DialogTitle>New community post</DialogTitle>
                <DialogDescription>
                  Published as your signed-in account. Appears immediately in the app feed.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                {createError ? (
                  <div className="rounded-[var(--radius-md)] border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-100">
                    {createError}
                  </div>
                ) : null}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                    Content
                  </label>
                  <textarea
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className={cn(
                      'min-h-[120px] w-full resize-y rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] shadow-[var(--shadow-xs)] focus-visible:outline-none focus-visible:border-[var(--border-focus)] focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-0 dark:bg-white/[0.05]',
                    )}
                    placeholder="What do you want to share?"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                    Image URL (optional)
                  </label>
                  <Input
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://…"
                    disabled={!!newFile}
                  />
                  <p className="text-xs text-[var(--text-muted)]">
                    Or upload a file below. URL is ignored when a file is selected.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                    Upload image
                  </label>
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-4 py-6 text-center text-sm text-[var(--text-secondary)] transition hover:border-[var(--accent-soft)]">
                    <ImagePlus className="h-8 w-8 text-[var(--text-muted)]" />
                    <span>{newFile ? newFile.name : 'JPEG, PNG, GIF or WebP — max ~5 MB'}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      className="sr-only"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        setNewFile(f ?? null);
                        setCreateError(null);
                      }}
                    />
                  </label>
                  {newFile ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() => setNewFile(null)}
                    >
                      Remove file
                    </Button>
                  ) : null}
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={createMutation.isPending || !newContent.trim()}
                  onClick={() => {
                    setCreateError(null);
                    createMutation.mutate({
                      content: newContent.trim(),
                      imageUrl: newImageUrl.trim() || undefined,
                      file: newFile,
                    });
                  }}
                >
                  {createMutation.isPending ? 'Publishing…' : 'Publish to feed'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={!!editPost} onOpenChange={(open) => !open && setEditPost(null)}>
            <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto rounded-[var(--radius-lg)]">
              <DialogHeader>
                <DialogTitle>Edit post</DialogTitle>
                <DialogDescription>Update the post text and image link as shown in the app.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                    Content
                  </label>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className={cn(
                      'min-h-[140px] w-full resize-y rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] shadow-[var(--shadow-xs)] focus-visible:outline-none focus-visible:border-[var(--border-focus)] focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-0 dark:bg-white/[0.05]',
                    )}
                    placeholder="Post text…"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                    Image URL (optional)
                  </label>
                  <Input
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                    placeholder="https://…"
                  />
                  <p className="text-xs text-[var(--text-muted)]">Leave empty to remove the image.</p>
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => setEditPost(null)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={updateMutation.isPending || !editContent.trim()}
                  onClick={() => {
                    if (!editPost) return;
                    updateMutation.mutate({
                      id: editPost.id,
                      content: editContent.trim(),
                      imageUrl: editImageUrl.trim() === '' ? null : editImageUrl.trim(),
                    });
                  }}
                >
                  {updateMutation.isPending ? 'Saving…' : 'Save changes'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
