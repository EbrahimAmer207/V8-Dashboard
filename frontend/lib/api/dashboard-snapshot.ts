import type { DashboardSnapshot } from '@/lib/dashboard-data';
import { mapBackendDashboardToFrontend } from '@/lib/adapters/map-backend-dashboard';
import { apiService } from '@/services/api.service';

export async function fetchDashboardSnapshot(): Promise<DashboardSnapshot> {
  const response = await apiService.get('/dashboard/snapshot');
  return mapBackendDashboardToFrontend(response.data);
}
