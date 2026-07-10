'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { 
  MessageSquare, 
  ThumbsUp, 
  User as UserIcon, 
  Image as ImageIcon,
  Clock,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import { apiService } from '@/services/api.service';
import { SectionCard } from '@/components/ui/workspace';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { type SocialPost } from '@/lib/dashboard-data';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/workspace';
import {
  getSocialPostImageFallback,
  getSocialPostImageSrc,
  resolveMediaUrl,
} from '@/lib/media-url';
export function SocialFeed() {
  const { data: posts = [], isLoading } = useQuery<SocialPost[]>({
    queryKey: ['social-feed-dashboard'],
    queryFn: async () => {
      const response = await apiService.get('/social/feed');
      return response.data?.data || response.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <SectionCard title="Community Highlights" description="Latest activity from the social feed.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3 rounded-[var(--radius-lg)] border border-[var(--border)] p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-32 w-full rounded-[var(--radius-md)]" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard 
      title="Community Highlights" 
      description="Visual oversight of recent social interactions and user-generated content."
      actions={
        <Badge variant="brand" dot className="animate-pulse">
          {posts.length} posts
        </Badge>
      }
    >
      {posts.length === 0 ? (
        <EmptyState
          title="No posts found"
          description="Community posts will appear here as soon as they are published."
          icon={MessageSquare}
        />
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: Math.min(index, 8) * 0.05 }}
            className="group relative flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-elevated)] shadow-[var(--shadow-sm)] transition-all hover:border-[var(--accent-soft)] hover:shadow-[var(--shadow-md)]"
          >
            {/* Author Header */}
            <div className="flex items-center gap-2.5 p-3.5 pb-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface-muted)]">
              {post.author?.avatar ? (
                  <img src={resolveMediaUrl(post.author.avatar)} alt="" className="h-full w-full object-cover" />
                ) : (
                  <UserIcon className="h-4 w-4 text-[var(--text-tertiary)]" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-[var(--text-primary)]">
                  {post.author?.firstName} {post.author?.lastName}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
                  <Clock className="h-2.5 w-2.5" />
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </div>
              </div>
            </div>

            {/* Post Content */}
            <div className="p-3.5 pb-2">
              <p className="line-clamp-3 text-[13px] leading-relaxed text-[var(--text-secondary)]">
                {post.content}
              </p>
            </div>

            {/* Image Placeholder or Actual Image */}
            <div className="relative mt-auto aspect-video w-full overflow-hidden bg-[var(--surface-muted)]">
              {post.imageUrl ? (
                <img
                  src={getSocialPostImageSrc(post.id, post.imageUrl)}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    const fallback = getSocialPostImageFallback(post.id, post.imageUrl);
                    if (fallback && target.src !== fallback) {
                      target.src = fallback;
                      return;
                    }
                    target.style.display = 'none';
                    target.parentElement
                      ?.querySelector('[data-post-image-fallback]')
                      ?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div
                data-post-image-fallback
                className={
                  post.imageUrl
                    ? 'hidden'
                    : 'flex h-full w-full items-center justify-center text-[var(--text-tertiary)]'
                }
              >
                <ImageIcon className="h-8 w-8 opacity-20" />
              </div>
              
              {/* Overlay on Hover */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <ExternalLink className="h-6 w-6 text-white" />
              </div>
            </div>

            {/* Footer Stats */}
            <div className="flex items-center justify-between border-t border-[var(--border)] px-3.5 py-2.5">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-[11px] font-medium text-[var(--text-secondary)]">
                  <ThumbsUp className="h-3 w-3 text-sky-500" />
                  {post._count?.likes || 0}
                </div>
                <div className="flex items-center gap-1 text-[11px] font-medium text-[var(--text-secondary)]">
                  <MessageSquare className="h-3 w-3 text-violet-500" />
                  {post._count?.comments || 0}
                </div>
              </div>
              <Link
                href="/social"
                className="text-[10px] font-semibold uppercase tracking-wider text-[var(--accent-strong)] hover:underline"
              >
                Moderate
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionCard>
  );
}
