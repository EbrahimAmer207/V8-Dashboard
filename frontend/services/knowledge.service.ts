import { apiService } from './api.service';

export const knowledgeService = {
  getAll: (params?: any) => apiService.get('/knowledge', { params }),
  getOne: (id: string) => apiService.get(`/knowledge/${id}`),
  getStats: () => apiService.get('/knowledge/stats'),
  create: (data: any) => apiService.post('/knowledge', data),
  update: (id: string, data: any) => apiService.patch(`/knowledge/${id}`, data),
  remove: (id: string) => apiService.delete(`/knowledge/${id}`),
};
