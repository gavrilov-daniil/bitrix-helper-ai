import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getDashboardStatus } from '../api/dashboardApi'
import { testConnection } from '../api/bitrixApi'
import { testAiConnection } from '../api/aiApi'
import ConnectionStatusBadge from '../components/ConnectionStatus'
import ServiceStatusCard from '../components/ServiceStatusCard'
import type { DashboardStatus } from '../types'

export default function Dashboard() {
  const queryClient = useQueryClient()

  const { data: status, isLoading, error } = useQuery<DashboardStatus>({
    queryKey: ['dashboard-status'],
    queryFn: getDashboardStatus,
  })

  const testBitrixMutation = useMutation({
    mutationFn: (id: number) => testConnection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-status'] })
    },
  })

  const testAiMutation = useMutation({
    mutationFn: (id: number) => testAiConnection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-status'] })
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-800">Failed to load dashboard. Is the backend running?</p>
      </div>
    )
  }

  if (!status) return null

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500">Overview of all connections and services.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 sm:grid-cols-2 mb-8">
        <ServiceStatusCard
          title="Bitrix24 Connections"
          total={status.bitrix.total}
          connected={status.bitrix.connected}
          error={status.bitrix.error}
          disconnected={status.bitrix.disconnected}
        />
        <ServiceStatusCard
          title="AI Providers"
          total={status.ai.total}
          connected={status.ai.connected}
          error={status.ai.error}
          disconnected={status.ai.disconnected}
        />
      </div>

      {/* Bitrix Connections */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Bitrix24 Connections</h3>
          <Link
            to="/settings"
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            + New Connection
          </Link>
        </div>

        {status.bitrix.connections.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500">No Bitrix24 connections yet.</p>
            <Link
              to="/settings"
              className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-500"
            >
              Create one
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {status.bitrix.connections.map((conn) => (
              <div
                key={conn.id}
                className="bg-white rounded-lg border border-gray-200 shadow-sm p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 truncate">{conn.name}</h4>
                  <Link
                    to={`/settings/${conn.id}`}
                    className="text-gray-400 hover:text-gray-600 text-xs"
                  >
                    Edit
                  </Link>
                </div>
                <p className="text-sm text-gray-500 mb-2 truncate">{conn.domain}</p>
                <ConnectionStatusBadge
                  status={conn.last_status}
                  lastCheckedAt={conn.last_checked_at}
                  errorMessage={conn.error_message}
                />
                <button
                  onClick={() => testBitrixMutation.mutate(conn.id)}
                  disabled={testBitrixMutation.isPending}
                  className="mt-3 w-full text-center text-sm font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50"
                >
                  {testBitrixMutation.isPending ? 'Testing...' : 'Test Connection'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Connections */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">AI Providers</h3>
          <Link
            to="/ai-settings"
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Manage AI
          </Link>
        </div>

        {status.ai.connections.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500">No AI connections yet.</p>
            <Link
              to="/ai-settings"
              className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-500"
            >
              Add one
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {status.ai.connections.map((conn) => (
              <div
                key={conn.id}
                className="bg-white rounded-lg border border-gray-200 shadow-sm p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 truncate">{conn.name}</h4>
                  <span className="text-xs text-gray-500">
                    {conn.provider === 'openai' ? 'OpenAI' : 'Anthropic'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-1">{conn.model}</p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-400">Priority: {conn.priority}</span>
                  {!conn.is_active && (
                    <span className="text-xs text-yellow-600">Inactive</span>
                  )}
                </div>
                <ConnectionStatusBadge
                  status={conn.last_status}
                  lastCheckedAt={conn.last_checked_at}
                  errorMessage={conn.error_message}
                />
                <button
                  onClick={() => testAiMutation.mutate(conn.id)}
                  disabled={testAiMutation.isPending}
                  className="mt-3 w-full text-center text-sm font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50"
                >
                  {testAiMutation.isPending ? 'Testing...' : 'Test Connection'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
