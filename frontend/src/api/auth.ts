import { api } from './client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  branchId?: string;
  branch?: { id: string; name: string };
  isActive: boolean;
  createdAt: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>('/auth/login', { email, password }),

  register: (data: { name: string; email: string; password: string; role?: string; branchId?: string }) =>
    api.post<LoginResponse>('/auth/register', data),

  me: () => api.get<User>('/auth/me'),

  changePassword: (oldPassword: string, newPassword: string) =>
    api.post<{ message: string }>('/auth/change-password', { oldPassword, newPassword }),
};

export const usersApi = {
  list: (params?: string) => api.get<any>(`/users${params || ''}`),
  get: (id: string) => api.get<any>(`/users/${id}`),
  create: (data: any) => api.post<any>('/users', data),
  update: (id: string, data: any) => api.put<any>(`/users/${id}`, data),
  delete: (id: string) => api.delete<any>(`/users/${id}`),
};
