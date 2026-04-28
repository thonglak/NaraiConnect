import { v1 } from './api';

export type DashboardStats = {
  clients: { total: number; active: number; deleted: number };
  tokens: { activeAccess: number; activeRefresh: number };
  authCodes: { active: number };
  scopes: { total: number };
  recentClients: {
    clientId: string;
    clientName: string | null;
    createdAt: string | null;
    isActive: number;
    deletedAt: string | null;
  }[];
};

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const res = await v1.dashboard.stats.get();
  if (res.error) {
    throw new Error(res.error.value?.error?.message ?? 'Failed to load stats');
  }
  return res.data as DashboardStats;
};
