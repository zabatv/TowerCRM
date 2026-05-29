import { api } from './client';

export const groupsApi = {
  list: (params?: string) => api.get<any>(`/groups${params || ''}`),
  get: (id: string) => api.get<any>(`/groups/${id}`),
  create: (data: any) => api.post<any>('/groups', data),
  update: (id: string, data: any) => api.put<any>(`/groups/${id}`, data),
  delete: (id: string) => api.delete<any>(`/groups/${id}`),
};
