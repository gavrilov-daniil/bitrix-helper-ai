import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAiConnections,
  createAiConnection,
  updateAiConnection,
  deleteAiConnection,
  testAiConnection,
} from '../api/aiApi'
import AiConnectionForm from '../components/AiConnectionForm'
import ConnectionStatusBadge from '../components/ConnectionStatus'
import type { AiConnection, AiConnectionFormData } from '../types'

export default function AiSettings() {
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)

  const { data: connections, isLoading } = useQuery({
    queryKey: ['ai-connections'],
    queryFn: getAiConnections,
  })

  const createMutation = useMutation({
    mutationFn: createAiConnection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-connections'] })
      setShowForm(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AiConnectionFormData> }) =>
      updateAiConnection(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-connections'] })
      setEditingId(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAiConnection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-connections'] })
    },
  })

  const testMutation = useMutation({
    mutationFn: testAiConnection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-connections'] })
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  const editingConnection = connections?.find((c) => c.id === editingId)

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Connections</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your AI provider connections. Lower priority = tried first (fallback chain).
          </p>
        </div>
        {!showForm && !editingId && (
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 sm:mt-0 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            + New AI Connection
          </button>
        )}
      </div>

      {(showForm || editingId) && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {editingId ? 'Edit AI Connection' : 'New AI Connection'}
            </h3>
            <button
              onClick={() => { setShowForm(false); setEditingId(null) }}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              Cancel
            </button>
          </div>
          <AiConnectionForm
            initialData={editingConnection ? {
              name: editingConnection.name,
              provider: editingConnection.provider,
              model: editingConnection.model,
              priority: editingConnection.priority,
              is_active: editingConnection.is_active,
            } : undefined}
            onSubmit={async (data) => {
              if (editingId) {
                await updateMutation.mutateAsync({ id: editingId, data })
              } else {
                await createMutation.mutateAsync(data)
              }
            }}
            onTest={editingId ? () => testAiConnection(editingId) : undefined}
            isEdit={!!editingId}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </div>
      )}

      {!connections || connections.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
          </svg>
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No AI connections</h3>
          <p className="mt-1 text-sm text-gray-500">Add an OpenAI or Claude connection to get started.</p>
          {!showForm && (
            <div className="mt-6">
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
              >
                + New AI Connection
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {connections.map((conn: AiConnection) => (
            <div
              key={conn.id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium text-gray-900">{conn.name}</h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                        {conn.provider === 'openai' ? 'OpenAI' : 'Anthropic'}
                      </span>
                      <span className="text-xs text-gray-500">{conn.model}</span>
                      {!conn.is_active && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-3">
                      <span className="text-xs text-gray-500">Priority: {conn.priority}</span>
                      <ConnectionStatusBadge
                        status={conn.last_status}
                        lastCheckedAt={conn.last_checked_at}
                        errorMessage={conn.error_message}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => testMutation.mutate(conn.id)}
                    disabled={testMutation.isPending}
                    className="text-sm text-blue-600 hover:text-blue-500 disabled:opacity-50"
                  >
                    Test
                  </button>
                  <button
                    onClick={() => { setEditingId(conn.id); setShowForm(false) }}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this AI connection?')) {
                        deleteMutation.mutate(conn.id)
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="text-sm text-red-600 hover:text-red-500 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
