import { api } from './client';

export const lessonsApi = {
  list: (params?: string) => api.get<any>(`/lessons${params || ''}`),
  calendar: (params?: string) => api.get<any>(`/lessons/calendar${params || ''}`),
  get: (id: string) => api.get<any>(`/lessons/${id}`),
  create: (data: any) => api.post<any>('/lessons', data),
  update: (id: string, data: any) => api.put<any>(`/lessons/${id}`, data),
  markAttendance: (id: string, attendance: Array<{ userId: string; status: string }>) =>
    api.post<any>(`/lessons/${id}/attendance`, { attendance }),
  delete: (id: string) => api.delete<any>(`/lessons/${id}`),
};
