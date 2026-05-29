import { api } from './client';

export const branchesApi = {
  list: (params?: string) => api.get<any>(`/branches${params || ''}`),
  get: (id: string) => api.get<any>(`/branches/${id}`),
  create: (data: any) => api.post<any>('/branches', data),
  update: (id: string, data: any) => api.put<any>(`/branches/${id}`, data),
  delete: (id: string) => api.delete<any>(`/branches/${id}`),
};
