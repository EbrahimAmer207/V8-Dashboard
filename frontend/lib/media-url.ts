const DEFAULT_API_URL = 'http://localhost:3001/api/v1';

/**
 * Same logic as podcasts / therapists / sessions / chat pages.
 * Keeps global media behavior unchanged for the rest of the dashboard.
 */
const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL)
  .replace(/\/api\/v1\/?$/, '')
  .replace(/\/$/, '');

const MEDIA_ORIGIN = (process.env.NEXT_PUBLIC_MEDIA_URL || API_ORIGIN).replace(/\/$/, '');

/** Mobile / production host for uploaded media from the app backend. */
const REMOTE_MEDIA_ORIGIN = (
  process.env.NEXT_PUBLIC_SOCIAL_MEDIA_URL || 'http://e7nama3ak.runasp.net'
).replace(/\/$/, '');

export const DEFAULT_PODCAST_COVER_PATH = '/uploads/default-cover.jpg';

function resolveRemoteMediaUrl(url: string): string {
  const normalized = url.trim();
  if (
    /^(https?:)?\/\//i.test(normalized) ||
    normalized.startsWith('data:') ||
    normalized.startsWith('blob:')
  ) {
    return normalized;
  }

  const origin =
    normalized.startsWith('/uploads') || normalized.startsWith('/images')
      ? REMOTE_MEDIA_ORIGIN
      : API_ORIGIN;

  return `${origin}${normalized.startsWith('/') ? normalized : `/${normalized}`}`;
}

/** Shared resolver — identical behavior to other dashboard pages. */
export function resolveMediaUrl(url?: string | null): string {
  if (!url) return '';
  const normalized = url.trim();
  if (
    /^(https?:)?\/\//i.test(normalized) ||
    normalized.startsWith('data:') ||
    normalized.startsWith('blob:')
  ) {
    return normalized;
  }

  const origin =
    normalized.startsWith('/uploads') || normalized.startsWith('/images')
      ? MEDIA_ORIGIN
      : API_ORIGIN;

  return `${origin}${normalized.startsWith('/') ? normalized : `/${normalized}`}`;
}

/** Absolute API base for the social post image proxy (handles relative `/api` base). */
function getApiBaseUrl(): string {
  const configured = (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL).replace(/\/$/, '');
  if (typeof window !== 'undefined' && configured.startsWith('/')) {
    return `${window.location.origin}${configured}`;
  }
  return configured;
}

function resolvePostDbImageUrl(postId: string | number): string {
  return `${getApiBaseUrl()}/social/posts/${postId}/image`;
}

function resolveSocialPostMediaUrl(url: string): string {
  return resolveRemoteMediaUrl(url);
}

/** Podcast cover — production media host; empty string means use UI placeholder. */
export function getPodcastCoverSrc(coverImageUrl?: string | null): string {
  const normalized = coverImageUrl?.trim() || '';
  if (!normalized || /default-cover/i.test(normalized)) return '';
  return resolveRemoteMediaUrl(normalized);
}

/** Social post images only — does not affect podcasts, therapists, etc. */
export function getSocialPostImageSrc(postId: string | number, imageUrl?: string | null): string {
  if (!imageUrl?.trim()) {
    return resolvePostDbImageUrl(postId);
  }

  return resolveSocialPostMediaUrl(imageUrl);
}

export function getSocialPostImageFallback(postId: string | number, imageUrl?: string | null): string {
  if (!imageUrl?.trim()) {
    return '';
  }

  const normalized = imageUrl.trim();
  if (
    /^(https?:)?\/\//i.test(normalized) ||
    normalized.startsWith('data:') ||
    normalized.startsWith('blob:')
  ) {
    return '';
  }

  return resolvePostDbImageUrl(postId);
}
