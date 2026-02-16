import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getConnection,
  createConnection,
  updateConnection,
  testConnection,
  deleteConnection,
} from '../api/bitrixApi'
import ConnectionForm from '../components/ConnectionForm'
import type { ConnectionFormData } from '../types'

export default function Settings() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEdit = !!id

  const { data: connection, isLoading } = useQuery({
    queryKey: ['connection', id],
    queryFn: () => getConnection(Number(id)),
    enabled: isEdit,
  })

  const createMutation = useMutation({
    mutationFn: createConnection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-status'] })
      navigate('/')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: ConnectionFormData) => updateConnection(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] })
      queryClient.invalidateQueries({ queryKey: ['connection', id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-status'] })
      navigate('/')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteConnection(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-status'] })
      navigate('/')
    },
  })

  async function handleSubmit(data: ConnectionFormData) {
    if (isEdit) {
      await updateMutation.mutateAsync(data)
    } else {
      await createMutation.mutateAsync(data)
    }
  }

  async function handleTest(_data: ConnectionFormData) {
    if (!isEdit || !id) {
      return { status: 'error' as const, message: 'Save the connection first, then test it.' }
    }
    return testConnection(Number(id))
  }

  if (isEdit && isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Connection' : 'New Connection'}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {isEdit
            ? 'Update your Bitrix24 connection settings.'
            : 'Add a new Bitrix24 connection. You can use a webhook or OAuth 2.0.'}
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <ConnectionForm
          initialData={
            connection
              ? {
                  name: connection.name,
                  domain: connection.domain,
                  bitrix_user_id: connection.bitrix_user_id,
                  auth_type: connection.auth_type,
                }
              : undefined
          }
          onSubmit={handleSubmit}
          onTest={isEdit ? handleTest : undefined}
          isEdit={isEdit}
          isLoading={createMutation.isPending || updateMutation.isPending}
          oauthConnected={connection?.oauth_connected}
          connectionId={connection?.id}
        />
      </div>

      {isEdit && (
        <div className="mt-6 bg-white rounded-lg border border-red-200 shadow-sm p-6">
          <h3 className="text-lg font-medium text-red-900">Danger Zone</h3>
          <p className="mt-1 text-sm text-gray-500">
            Permanently delete this connection. This action cannot be undone.
          </p>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this connection?')) {
                deleteMutation.mutate()
              }
            }}
            disabled={deleteMutation.isPending}
            className="mt-4 inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50"
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete Connection'}
          </button>
        </div>
      )}
    </div>
  )
}
