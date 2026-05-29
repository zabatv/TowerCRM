import { api } from './client';

export const dashboardApi = {
  stats: () => api.get<any>('/dashboard/stats'),
};
