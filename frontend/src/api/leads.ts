import { api } from './client';

export const leadsApi = {
  list: (params?: string) => api.get<any>(`/leads${params || ''}`),
  get: (id: string) => api.get<any>(`/leads/${id}`),
  create: (data: any) => api.post<any>('/leads', data),
  update: (id: string, data: any) => api.put<any>(`/leads/${id}`, data),
  convert: (id: string, userId?: string) => api.post<any>(`/leads/${id}/convert`, { userId }),
  bulkAssign: (ids: string[], assignedTo: string) => api.post<any>('/leads/bulk-assign', { ids, assignedTo }),
  bulkDelete: (ids: string[]) => api.post<any>('/leads/bulk-delete', { ids }),
  delete: (id: string) => api.delete<any>(`/leads/${id}`),
};
