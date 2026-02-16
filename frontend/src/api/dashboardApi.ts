import client from './client';
import type { DashboardStatus } from '../types';

export async function getDashboardStatus(): Promise<DashboardStatus> {
  const { data } = await client.get<{ data: DashboardStatus }>('/dashboard/status');
  return data.data;
}
