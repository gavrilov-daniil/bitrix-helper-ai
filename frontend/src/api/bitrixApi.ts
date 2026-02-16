import axios from 'axios';
import type { BitrixConnection, ConnectionTestResult, ConnectionFormData } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export async function getConnections(): Promise<BitrixConnection[]> {
  const { data } = await api.get<{ data: BitrixConnection[] }>('/connections');
  return data.data;
}

export async function getConnection(id: number): Promise<BitrixConnection> {
  const { data } = await api.get<{ data: BitrixConnection }>(`/connections/${id}`);
  return data.data;
}

export async function createConnection(form: ConnectionFormData): Promise<BitrixConnection> {
  const { data } = await api.post<{ data: BitrixConnection }>('/connections', form);
  return data.data;
}

export async function updateConnection(id: number, form: Partial<ConnectionFormData>): Promise<BitrixConnection> {
  const { data } = await api.put<{ data: BitrixConnection }>(`/connections/${id}`, form);
  return data.data;
}

export async function deleteConnection(id: number): Promise<void> {
  await api.delete(`/connections/${id}`);
}

export async function testConnection(id: number): Promise<ConnectionTestResult> {
  const { data } = await api.post<{ data: ConnectionTestResult }>(`/connections/${id}/test`);
  return data.data;
}
