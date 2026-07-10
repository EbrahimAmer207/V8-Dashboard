'use client';

import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user.service';

export interface PlatformUsersResponse {
  data: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    region: string;
    lastActive: string;
    requestsCount: number;
  }>;
  pagination: { total: number; page: number; limit: number; pages: number };
}

export function usePlatformUsers(params: { page: number; search: string; role: string; status: string }) {
  return useQuery({
    queryKey: ['platform-users', params],
    queryFn: async () => {
      const sp = new URLSearchParams({
        page: String(params.page),
        limit: '10',
        search: params.search,
        role: params.role,
        status: params.status,
      });
      const response = await userService.getUsers(Object.fromEntries(sp.entries()));
      return response as PlatformUsersResponse;
    },
  });
}
