import { apiService } from './api.service';

export const userService = {
  // Core CRUD methods
  getAll: async (params?: any) => {
    const response = await apiService.get('/users', { params: { page: 1, limit: 50, ...params } });
    return response.data?.data || response.data;
  },
  
  getUsers: async (params?: any) => {
    const response = await apiService.get('/users', { params: { page: 1, limit: 50, ...params } });
    const result = response.data;
    return {
      data: result.data || [],
      pagination: result.pagination,
    };
  },

  getOne: async (id: string) => {
    const response = await apiService.get(`/users/${id}`);
    return response.data?.data || response.data;
  },

  getStats: async () => {
    const response = await apiService.get('/users/stats');
    return response.data?.data || response.data;
  },

  create: async (data: any) => {
    const response = await apiService.post('/users', data);
    return response.data?.data || response.data;
  },

  createUser: async (data: any) => {
    const response = await apiService.post('/users', data);
    return response.data?.data || response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiService.put(`/users/${id}`, data);
    return response.data?.data || response.data;
  },

  updateUser: async (id: string, data: any) => {
    const response = await apiService.put(`/users/${id}`, data);
    return response.data?.data || response.data;
  },

  remove: async (id: string) => {
    const response = await apiService.delete(`/users/${id}`);
    return response.data?.data || response.data;
  },

  deleteUser: async (id: string) => {
    const response = await apiService.delete(`/users/${id}`);
    return response.data?.data || response.data;
  },

  // Support-specific Admin actions
  updateStatus: async (id: string, status: string) => {
    const response = await apiService.put(`/users/${id}`, { status });
    return response.data?.data || response.data;
  },

  updateType: async (id: string, type: string) => {
    const response = await apiService.put(`/users/${id}`, { type });
    return response.data?.data || response.data;
  },

  search: async (query: string, limit?: number) => {
    const response = await apiService.get('/users/search', { 
      params: { q: query, limit: limit || 10 } 
    });
    return response.data?.data || response.data;
  },

  getActivityLog: async (userId: string, limit?: number) => {
    const response = await apiService.get(`/users/${userId}/activity`, { 
      params: { limit: limit || 50 } 
    });
    return response.data?.data || response.data;
  },
};
