import client from './client';
import type { AiConnection, AiConnectionFormData, ConnectionTestResult } from '../types';

export async function getAiConnections(): Promise<AiConnection[]> {
  const { data } = await client.get<{ data: AiConnection[] }>('/ai-connections');
  return data.data;
}

export async function getAiConnection(id: number): Promise<AiConnection> {
  const { data } = await client.get<{ data: AiConnection }>(`/ai-connections/${id}`);
  return data.data;
}

export async function createAiConnection(form: AiConnectionFormData): Promise<AiConnection> {
  const { data } = await client.post<{ data: AiConnection }>('/ai-connections', form);
  return data.data;
}

export async function updateAiConnection(id: number, form: Partial<AiConnectionFormData>): Promise<AiConnection> {
  const { data } = await client.put<{ data: AiConnection }>(`/ai-connections/${id}`, form);
  return data.data;
}

export async function deleteAiConnection(id: number): Promise<void> {
  await client.delete(`/ai-connections/${id}`);
}

export async function testAiConnection(id: number): Promise<ConnectionTestResult> {
  const { data } = await client.post<{ data: ConnectionTestResult }>(`/ai-connections/${id}/test`);
  return data.data;
}
