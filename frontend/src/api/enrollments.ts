import { api } from './client';

export const enrollmentsApi = {
  list: (params?: string) => api.get<any>(`/enrollments${params || ''}`),
  create: (data: { userId: string; groupId: string }) => api.post<any>('/enrollments', data),
  updateStatus: (id: string, status: string) => api.put<any>(`/enrollments/${id}/status`, { status }),
  delete: (id: string) => api.delete<any>(`/enrollments/${id}`),
};
