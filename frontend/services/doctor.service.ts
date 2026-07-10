import { apiService } from './api.service';

export const doctorService = {
  getAll: async () => {
    const response = await apiService.get('/doctors');
    return response.data?.data || response.data;
  },

  getOne: async (id: string) => {
    const response = await apiService.get(`/doctors/${id}`);
    return response.data?.data || response.data;
  },

  create: async (data: any) => {
    const response = await apiService.post('/doctors', data);
    return response.data?.data || response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiService.patch(`/doctors/${id}`, data);
    return response.data?.data || response.data;
  },

  remove: async (id: string) => {
    const response = await apiService.delete(`/doctors/${id}`);
    return response.data?.data || response.data;
  },

  search: async (query: string) => {
    const response = await apiService.get('/doctors/search', { params: { q: query } });
    return response.data?.data || response.data;
  }
};
