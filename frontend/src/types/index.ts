export type ConnectionStatus = 'connected' | 'disconnected' | 'error';

export interface BitrixConnection {
  id: number;
  name: string;
  domain: string;
  bitrix_user_id: number;
  is_active: boolean;
  last_status: ConnectionStatus;
  last_checked_at: string | null;
  server_time: string | null;
  available_scopes: string[] | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConnectionTestResult {
  status: ConnectionStatus;
  server_time?: string;
  scopes?: string[];
  has_task_scope?: boolean;
  message: string;
  error_code?: string;
}

export interface ConnectionFormData {
  name: string;
  domain: string;
  bitrix_user_id: number;
  webhook_code: string;
}
