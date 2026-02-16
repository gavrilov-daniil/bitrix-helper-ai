import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getConnections, testConnection } from '../api/bitrixApi'
import ConnectionStatusBadge from '../components/ConnectionStatus'
import type { BitrixConnection } from '../types'

export default function Dashboard() {
  const queryClient = useQueryClient()

  const { data: connections, isLoading, error } = useQuery({
    queryKey: ['connections'],
    queryFn: getConnections,
  })

  const testMutation = useMutation({
    mutationFn: (id: number) => testConnection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] })
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
        <p className="text-sm text-red-800">Failed to load connections. Is the backend running?</p>
      </div>
    )
  }

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Connections</h2>
          <p className="mt-1 text-sm text-gray-500">Your Bitrix24 connections and their status.</p>
        </div>
        <Link
          to="/settings"
          className="mt-4 sm:mt-0 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
        >
          + New Connection
        </Link>
      </div>

      {!connections || connections.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No connections</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new Bitrix24 connection.</p>
          <div className="mt-6">
            <Link
              to="/settings"
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              + New Connection
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {connections.map((conn: BitrixConnection) => (
            <div
              key={conn.id}
              className="bg-white overflow-hidden rounded-lg border border-gray-200 shadow-sm"
            >
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-gray-900 truncate">{conn.name}</h3>
                  <Link
                    to={`/settings/${conn.id}`}
                    className="text-gray-400 hover:text-gray-600"
                    title="Edit"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                    </svg>
                  </Link>
                </div>

                <p className="text-sm text-gray-500 mb-4 truncate">{conn.domain}</p>

                <ConnectionStatusBadge
                  status={conn.last_status}
                  lastCheckedAt={conn.last_checked_at}
                  errorMessage={conn.error_message}
                />

                {conn.available_scopes && conn.available_scopes.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {conn.available_scopes.slice(0, 5).map((scope) => (
                      <span
                        key={scope}
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs ${
                          scope === 'task' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {scope}
                      </span>
                    ))}
                    {conn.available_scopes.length > 5 && (
                      <span className="text-xs text-gray-400">
                        +{conn.available_scopes.length - 5}
                      </span>
                    )}
                  </div>
                )}

                {conn.server_time && (
                  <p className="mt-2 text-xs text-gray-400">
                    Server: {new Date(conn.server_time).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="bg-gray-50 px-4 py-3">
                <button
                  onClick={() => testMutation.mutate(conn.id)}
                  disabled={testMutation.isPending}
                  className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50"
                >
                  {testMutation.isPending ? 'Testing...' : 'Test Connection'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
