import api from './api';
import type { AuthResponse, LoginData, RegisterData, User } from '../types';

export const authService = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/register', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/login', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/api/auth/logout');
  },

  getMe: async (): Promise<{ user: User }> => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  changePassword: async (
    oldPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> => {
    const response = await api.post('/api/auth/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  checkEmail: async (
    email: string,
  ): Promise<{ available: boolean; reason: string | null }> => {
    const response = await api.post('/api/auth/check-email', { email });
    return response.data;
  },

  checkPseudo: async (
    pseudo: string,
  ): Promise<{ available: boolean; reason: string | null }> => {
    const response = await api.post('/api/auth/check-pseudo', { pseudo });
    return response.data;
  },
};
