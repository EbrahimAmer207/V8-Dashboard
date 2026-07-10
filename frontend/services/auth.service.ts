import { apiService } from '@/services/api.service';
import { AuthResponse, LoginRequest, SignUpRequest } from '@/types';

export const authService = {
  login: (data: LoginRequest) => {
    return apiService.post<AuthResponse>('/Auth/admin-login', {
      email: data.email,
      password: data.password,
      rememberMe: true,
    });
  },

  signup: (data: SignUpRequest) => {
    return apiService.post<AuthResponse>('/auth/signup', data);
  },

  refreshToken: (refreshToken: string) => {
    return apiService.post<AuthResponse>('/auth/refresh', { refreshToken });
  },

  logout: () => {
    // Clear local storage and call backend if needed
    localStorage.removeItem('auth');
  },
};
