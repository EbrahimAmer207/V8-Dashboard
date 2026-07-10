'use client';

import React, { useMemo, useState } from 'react';
import { FileAudio, Mic } from 'lucide-react';
import { getPodcastCoverSrc } from '@/lib/media-url';
import { cn } from '@/lib/utils';

type PodcastCoverProps = {
  coverImageUrl?: string | null;
  alt?: string;
  className?: string;
  /** Card hero (16:9) or compact player thumbnail */
  variant?: 'card' | 'thumb';
};

export function PodcastCoverPlaceholder({
  variant = 'card',
  className,
}: {
  variant?: 'card' | 'thumb';
  className?: string;
}) {
  const Icon = variant === 'card' ? FileAudio : Mic;

  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,rgba(14,165,233,0.14),rgba(49,94,251,0.1))]',
        className,
      )}
      aria-hidden
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-white/70 shadow-sm dark:bg-slate-900/50',
          variant === 'card' ? 'h-16 w-16' : 'h-8 w-8',
        )}
      >
        <Icon
          className={cn('text-[var(--text-muted)]', variant === 'card' ? 'h-8 w-8' : 'h-4 w-4')}
        />
      </div>
    </div>
  );
}

export function PodcastCover({ coverImageUrl, alt = '', className, variant = 'card' }: PodcastCoverProps) {
  const [failed, setFailed] = useState(false);

  const src = useMemo(() => {
    if (failed) return '';
    return getPodcastCoverSrc(coverImageUrl);
  }, [coverImageUrl, failed]);

  if (!src) {
    return <PodcastCoverPlaceholder variant={variant} className={className} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn('h-full w-full object-cover', className)}
      onError={() => setFailed(true)}
    />
  );
}
