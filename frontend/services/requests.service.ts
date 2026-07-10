import { apiService } from './api.service';

export const requestsService = {
  // Core CRUD methods
  getAll: async (params?: any) => {
    const response = await apiService.get('/requests', { params: { page: 1, limit: 50, ...params } });
    return response.data?.data || response.data;
  },

  getRequests: async (params?: any) => {
    const response = await apiService.get('/requests', { params: { page: 1, limit: 50, ...params } });
    const result = response.data;
    return {
      data: result.data || [],
      pagination: result.pagination,
    };
  },

  getOne: async (id: string) => {
    const response = await apiService.get(`/requests/${id}`);
    return response.data?.data || response.data;
  },

  getStats: async () => {
    const response = await apiService.get('/requests/stats');
    return response.data?.data || response.data;
  },

  create: async (data: any) => {
    const response = await apiService.post('/requests', data);
    return response.data?.data || response.data;
  },

  createRequest: async (data: any) => {
    const response = await apiService.post('/requests', data);
    return response.data?.data || response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiService.patch(`/requests/${id}`, data);
    return response.data?.data || response.data;
  },

  updateRequest: async (id: string, data: any) => {
    const response = await apiService.patch(`/requests/${id}`, data);
    return response.data?.data || response.data;
  },

  remove: async (id: string) => {
    const response = await apiService.delete(`/requests/${id}`);
    return response.data?.data || response.data;
  },

  deleteRequest: async (id: string) => {
    const response = await apiService.delete(`/requests/${id}`);
    return response.data?.data || response.data;
  },

  // Request-specific actions
  approveRequest: async (requestId: string, caseTitle?: string) => {
    const response = await apiService.post(`/requests/${requestId}/approve`, { caseTitle });
    return response.data?.data || response.data;
  },

  rejectRequest: async (requestId: string, reason?: string) => {
    const response = await apiService.post(`/requests/${requestId}/reject`, { reason });
    return response.data?.data || response.data;
  },

  updateStatus: async (requestId: string, status: string) => {
    const response = await apiService.patch(`/requests/${requestId}/status`, { status });
    return response.data?.data || response.data;
  },

  search: async (query: string, limit?: number) => {
    const response = await apiService.get('/requests/search', { 
      params: { q: query, limit: limit || 10 } 
    });
    return response.data?.data || response.data;
  },

  getRequestsByUser: async (userId: string) => {
    const response = await apiService.get(`/requests/user/${userId}`);
    return response.data?.data || response.data;
  },

  getRequestsByStatus: async (status: string) => {
    const response = await apiService.get(`/requests/status/${status}`);
    return response.data?.data || response.data;
  },

  getRequestsByCategoryAndStatus: async (category: string, status: string) => {
    const response = await apiService.get(`/requests/category/${category}/${status}`);
    return response.data?.data || response.data;
  },
};
