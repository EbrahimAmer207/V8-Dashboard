import { apiService } from './api.service';

export const casesService = {
  // Core CRUD methods
  getAll: async (params?: any) => {
    const response = await apiService.get('/cases', { params: { page: 1, limit: 50, ...params } });
    return response.data?.data || response.data;
  },

  getCases: async (params?: any) => {
    const response = await apiService.get('/cases', { params: { page: 1, limit: 50, ...params } });
    const result = response.data;
    return {
      data: result.data || [],
      pagination: result.pagination,
    };
  },

  getOne: async (id: string) => {
    const response = await apiService.get(`/cases/${id}`);
    return response.data?.data || response.data;
  },

  getStats: async () => {
    const response = await apiService.get('/cases/stats');
    return response.data?.data || response.data;
  },

  create: async (data: any) => {
    const response = await apiService.post('/cases', data);
    return response.data?.data || response.data;
  },

  createCase: async (data: any) => {
    const response = await apiService.post('/cases', data);
    return response.data?.data || response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiService.patch(`/cases/${id}`, data);
    return response.data?.data || response.data;
  },

  updateCase: async (id: string, data: any) => {
    const response = await apiService.patch(`/cases/${id}`, data);
    return response.data?.data || response.data;
  },

  remove: async (id: string) => {
    const response = await apiService.delete(`/cases/${id}`);
    return response.data?.data || response.data;
  },

  deleteCase: async (id: string) => {
    const response = await apiService.delete(`/cases/${id}`);
    return response.data?.data || response.data;
  },

  // Case-specific actions
  assignCase: async (caseId: string, adminId: string) => {
    const response = await apiService.patch(`/cases/${caseId}/assign`, { adminId });
    return response.data?.data || response.data;
  },

  updateStatus: async (caseId: string, status: string) => {
    const response = await apiService.patch(`/cases/${caseId}/status`, { status });
    return response.data?.data || response.data;
  },

  updateProgress: async (caseId: string, progress: number) => {
    const response = await apiService.patch(`/cases/${caseId}/progress`, { progress });
    return response.data?.data || response.data;
  },

  updateSlaRemainingHours: async (caseId: string, hours: number) => {
    const response = await apiService.patch(`/cases/${caseId}/sla`, { hours });
    return response.data?.data || response.data;
  },

  addNote: async (caseId: string, note: string) => {
    const response = await apiService.post(`/cases/${caseId}/notes`, { note });
    return response.data?.data || response.data;
  },

  search: async (query: string, limit?: number) => {
    const response = await apiService.get('/cases/search', { 
      params: { q: query, limit: limit || 10 } 
    });
    return response.data?.data || response.data;
  },

  getCasesByPriority: async (priority: string) => {
    const response = await apiService.get(`/cases/priority/${priority}`);
    return response.data?.data || response.data;
  },
};
