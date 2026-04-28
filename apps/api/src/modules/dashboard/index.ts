import { Elysia } from 'elysia';
import { requireAdmin } from '../../lib/guard';
import { getDashboardStats } from './service';

export const dashboardPlugin = new Elysia({ prefix: '/dashboard' })
  .use(requireAdmin)
  .get('/stats', () => getDashboardStats());
