'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store';
import { userService } from '@/services/user.service';

export interface AdminUserRow {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role?: string;
  type?: string;
  status?: string;
  region?: string;
  lastActive?: string;
  lastLogin?: string;
  requestsCount?: number;
  isActive?: boolean;
}

export function useAdminUsersDirectory(q: {
  page: number;
  limit?: number;
  search?: string;
  role?: string;
  type?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ['admin-users-directory', q],
    queryFn: async () => {
      const res = await userService.getAll({
        page: q.page,
        limit: q.limit ?? 10,
        search: q.search || undefined,
        role: q.role && q.role !== 'all' ? q.role : undefined,
        type: q.type && q.type !== 'all' ? q.type : undefined,
      });

      const body = res.data as {
        data: AdminUserRow[];
        pagination: { total: number; page: number; limit: number; pages: number };
      };

      let rows = body.data ?? [];
      if (q.status && q.status !== 'all') {
        const map: Record<string, string> = {
          active: 'Active',
          banned: 'Banned',
          pending: 'Inactive',
        };
        const want = map[q.status] ?? q.status;
        rows = rows.filter((u) => (u.status ?? '') === want);
      }

      return { data: rows, pagination: body.pagination };
    },
  });
}
