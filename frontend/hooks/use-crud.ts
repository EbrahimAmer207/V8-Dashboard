/**
 * Custom Hooks for CRUD Operations
 * React Query + Zustand patterns
 */

import React, { useState } from 'react';
import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Generic CRUD Hook
 * Handles standard create, read, update, delete operations
 */
export function useCRUD<T extends { id: string }>(
  resourceName: string,
  service: {
    getAll: (filters?: any) => Promise<{ data: T[]; pagination?: any }>;
    getById: (id: string) => Promise<T>;
    create: (data: any) => Promise<T>;
    update: (id: string, data: any) => Promise<T>;
    delete: (id: string) => Promise<void>;
  },
) {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // GET ALL
  const getAllQuery = useQuery({
    queryKey: [resourceName],
    queryFn: () => service.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // GET BY ID
  const getByIdQuery = useQuery({
    queryKey: [resourceName, selectedId],
    queryFn: () => service.getById(selectedId!),
    enabled: !!selectedId,
  });

  // CREATE
  const createMutation = useMutation({
    mutationFn: (data: any) => service.create(data),
    onSuccess: (newItem) => {
      queryClient.setQueryData(
        [resourceName],
        (old: any) => ({
          ...old,
          data: [...(old?.data || []), newItem],
        }),
      );
    },
  });

  // UPDATE
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      service.update(id, data),
    onSuccess: (updatedItem) => {
      queryClient.setQueryData(
        [resourceName],
        (old: any) => ({
          ...old,
          data: (old?.data || []).map((item: T) =>
            item.id === updatedItem.id ? updatedItem : item,
          ),
        }),
      );
    },
  });

  // DELETE
  const deleteMutation = useMutation({
    mutationFn: (id: string) => service.delete(id),
    onSuccess: (_: unknown, id: string) => {
      queryClient.setQueryData(
        [resourceName],
        (old: any) => ({
          ...old,
          data: (old?.data || []).filter((item: T) => item.id !== id),
        }),
      );
    },
  });

  return {
    // Queries
    data: getAllQuery.data?.data || [],
    pagination: getAllQuery.data?.pagination,
    isLoading: getAllQuery.isLoading,
    error: getAllQuery.error,

    // Selected item
    selectedItem: getByIdQuery.data,
    setSelectedId,

    // Mutations
    create: createMutation.mutate,
    update: ({ id, data }: { id: string; data: any }) =>
      updateMutation.mutate({ id, data }),
    delete: deleteMutation.mutate,

    // Meta
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
  };
}

/**
 * Hook for paginated queries
 */
export function usePagination<T>(
  queryKey: string[],
  queryFn: (page: number, limit: number) => Promise<{ data: T[]; pagination: any }>,
  initialPage = 1,
  initialLimit = 20,
) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const { data, isLoading, error } = useQuery<{ data: T[]; pagination: any }>({
    queryKey: [queryKey, page, limit],
    queryFn: () => queryFn(page, limit),
    placeholderData: keepPreviousData,
  });

  return {
    data: data?.data || [],
    pagination: data?.pagination,
    page,
    limit,
    setPage,
    setLimit,
    isLoading,
    error,
  };
}

/**
 * Hook for search with debounce
 */
export function useSearch<T>(
  queryKey: string,
  searchFn: (query: string) => Promise<T[]>,
) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data = [], isLoading } = useQuery({
    queryKey: [queryKey, debouncedQuery],
    queryFn: () => searchFn(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });

  return {
    results: data,
    isLoading,
    setSearchQuery,
  };
}

/**
 * Hook for form handling with mutations
 */
export function useFormSubmit<T>(
  mutationFn: (data: T) => Promise<any>,
  onSuccess?: () => void,
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries();
      onSuccess?.();
    },
  });

  return {
    onSubmit: (data: T) => mutation.mutate(data),
    isSubmitting: mutation.isPending,
    error: mutation.error,
    isError: mutation.isError,
  };
}

/**
 * Hook for polling
 */
export function usePolling<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  interval = 5000,
  enabled = true,
) {
  return useQuery({
    queryKey,
    queryFn,
    refetchInterval: enabled ? interval : false,
    staleTime: 0,
  });
}

export function useInfiniteScroll<T>(
  queryKey: string,
  queryFn: (pageParam: number) => Promise<{ data: T[]; nextPage?: number }>,
) {
  return useInfiniteQuery({
    queryKey: [queryKey],
    queryFn: ({ pageParam = 1 }) => queryFn(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });
}
