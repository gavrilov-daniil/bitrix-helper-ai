export type ConnectionStatus = 'connected' | 'disconnected' | 'error';

export type BitrixAuthType = 'webhook' | 'oauth';

export interface BitrixConnection {
  id: number;
  name: string;
  domain: string;
  bitrix_user_id: number;
  auth_type: BitrixAuthType;
  is_active: boolean;
  last_status: ConnectionStatus;
  last_checked_at: string | null;
  server_time: string | null;
  available_scopes: string[] | null;
  error_message: string | null;
  oauth_connected: boolean;
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
  model?: string;
}

export interface ConnectionFormData {
  name: string;
  domain: string;
  bitrix_user_id: number;
  webhook_code: string;
  auth_type: BitrixAuthType;
  client_id?: string;
  client_secret?: string;
}

export type AiProvider = 'openai' | 'anthropic';

export interface AiConnection {
  id: number;
  name: string;
  provider: AiProvider;
  model: string;
  priority: number;
  is_active: boolean;
  last_status: ConnectionStatus;
  error_message: string | null;
  last_checked_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AiConnectionFormData {
  name: string;
  provider: AiProvider;
  api_key: string;
  model: string;
  priority: number;
  is_active: boolean;
}

export interface DashboardStatus {
  bitrix: {
    total: number;
    connected: number;
    error: number;
    disconnected: number;
    connections: BitrixConnection[];
  };
  ai: {
    total: number;
    connected: number;
    error: number;
    disconnected: number;
    connections: AiConnection[];
  };
}
