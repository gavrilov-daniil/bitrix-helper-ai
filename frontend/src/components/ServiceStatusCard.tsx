import type { ConnectionStatus } from '../types'

interface Props {
  title: string
  total: number
  connected: number
  error: number
  disconnected: number
}

const statusColors: Record<string, string> = {
  connected: 'text-green-600',
  error: 'text-red-600',
  disconnected: 'text-gray-500',
}

export default function ServiceStatusCard({ title, total, connected, error, disconnected }: Props) {
  const overallStatus: ConnectionStatus =
    error > 0 ? 'error' : connected > 0 ? 'connected' : 'disconnected'

  const borderColor =
    overallStatus === 'connected'
      ? 'border-green-200'
      : overallStatus === 'error'
        ? 'border-red-200'
        : 'border-gray-200'

  return (
    <div className={`bg-white rounded-lg border-2 ${borderColor} shadow-sm p-6`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <span className="text-2xl font-bold text-gray-900">{total}</span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className={statusColors.connected}>Connected</span>
          <span className={`font-medium ${statusColors.connected}`}>{connected}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className={statusColors.error}>Error</span>
          <span className={`font-medium ${statusColors.error}`}>{error}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className={statusColors.disconnected}>Not checked</span>
          <span className={`font-medium ${statusColors.disconnected}`}>{disconnected}</span>
        </div>
      </div>
    </div>
  )
}
