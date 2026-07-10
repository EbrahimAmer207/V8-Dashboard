import { apiService } from './api.service';

export const notificationsService = {
  getAll: (params?: any) => apiService.get('/notifications', { params }),
  getAllSystem: (params?: any) => apiService.get('/notifications/all', { params }),
  sendToUser: (data: {
    userId: string;
    title: string;
    message: string;
    type?: string;
    priority?: string;
  }) => apiService.post('/notifications/send', data),
  markAsRead: (id: string) => apiService.patch(`/notifications/${id}/read`),
  markAllRead: () => apiService.patch('/notifications/read-all'),
  remove: (id: string) => apiService.delete(`/notifications/${id}`),
};
