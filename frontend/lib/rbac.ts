import type { User } from '@/types';

export function canViewAnalytics(role: User['role'] | undefined) {
  return role === 'ADMIN' || role === 'MODERATOR' || role === 'EDITOR' || role === 'PROVIDER';
}

export function canManageUsers(role: User['role'] | undefined) {
  return role === 'ADMIN' || role === 'MODERATOR';
}

export function isStaff(role: User['role'] | undefined) {
  return role === 'ADMIN' || role === 'MODERATOR' || role === 'SUPPORT' || role === 'EDITOR';
}
