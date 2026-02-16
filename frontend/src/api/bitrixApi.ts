import client from './client';
import type { BitrixConnection, ConnectionTestResult, ConnectionFormData } from '../types';

export async function getConnections(): Promise<BitrixConnection[]> {
  const { data } = await client.get<{ data: BitrixConnection[] }>('/connections');
  return data.data;
}

export async function getConnection(id: number): Promise<BitrixConnection> {
  const { data } = await client.get<{ data: BitrixConnection }>(`/connections/${id}`);
  return data.data;
}

export async function createConnection(form: ConnectionFormData): Promise<BitrixConnection> {
  const { data } = await client.post<{ data: BitrixConnection }>('/connections', form);
  return data.data;
}

export async function updateConnection(id: number, form: Partial<ConnectionFormData>): Promise<BitrixConnection> {
  const { data } = await client.put<{ data: BitrixConnection }>(`/connections/${id}`, form);
  return data.data;
}

export async function deleteConnection(id: number): Promise<void> {
  await client.delete(`/connections/${id}`);
}

export async function testConnection(id: number): Promise<ConnectionTestResult> {
  const { data } = await client.post<{ data: ConnectionTestResult }>(`/connections/${id}/test`);
  return data.data;
}
