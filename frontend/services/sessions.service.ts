import { apiService } from './api.service';

export type SessionStatus = 'Scheduled' | 'Live' | 'Completed' | 'Cancelled';

export type ClinicalSession = {
  id: string;
  doctorId: string;
  patientId: string;
  patientName: string;
  doctor: {
    id: string | null;
    specialty: string;
    name?: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      avatar?: string | null;
    };
  };
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string | null;
  };
  sessionType: string;
  status: SessionStatus;
  startTime: string;
  price: number;
  videoUrl?: string | null;
  audioUrl?: string | null;
  pdfUrl?: string | null;
  imageUrl?: string | null;
  isStarted: boolean;
};

export type SessionPayload = {
  doctorId: string;
  patientId: string;
  startTime: string;
  sessionType?: string;
  status?: SessionStatus;
  price?: number;
  patientName?: string;
  videoUrl?: string | null;
  audioUrl?: string | null;
};

function unwrap<T>(response: { data?: T | { data?: T } }): T {
  const body = response.data as T | { data?: T } | undefined;
  if (body && typeof body === 'object' && 'data' in body && (body as { data?: T }).data !== undefined) {
    return (body as { data: T }).data;
  }
  return body as T;
}

export const sessionsService = {
  getAll: async (params?: { status?: string; doctorId?: string; patientId?: string }) => {
    const response = await apiService.get<ClinicalSession[]>('/sessions', { params });
    const data = unwrap<ClinicalSession[] | ClinicalSession>(response);
    return Array.isArray(data) ? data : [];
  },

  getOne: async (id: string) => {
    const response = await apiService.get<ClinicalSession>(`/sessions/${id}`);
    return unwrap<ClinicalSession>(response);
  },

  create: async (payload: SessionPayload) => {
    const response = await apiService.post<ClinicalSession>('/sessions', payload);
    return unwrap<ClinicalSession>(response);
  },

  update: async (id: string, payload: Partial<SessionPayload>) => {
    const response = await apiService.put<ClinicalSession>(`/sessions/${id}`, payload);
    return unwrap<ClinicalSession>(response);
  },

  updateStatus: async (id: string, status: SessionStatus) => {
    const response = await apiService.patch<ClinicalSession>(`/sessions/${id}/status`, { status });
    return unwrap<ClinicalSession>(response);
  },

  delete: async (id: string) => {
    const response = await apiService.delete(`/sessions/${id}`);
    return unwrap(response);
  },
};
