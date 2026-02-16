import type { ConnectionStatus as Status } from '../types'

interface Props {
  status: Status
  lastCheckedAt: string | null
  errorMessage?: string | null
}

const statusConfig: Record<Status, { color: string; bgColor: string; label: string }> = {
  connected: { color: 'bg-green-500', bgColor: 'bg-green-50 text-green-700', label: 'Connected' },
  disconnected: { color: 'bg-gray-400', bgColor: 'bg-gray-50 text-gray-600', label: 'Not checked' },
  error: { color: 'bg-red-500', bgColor: 'bg-red-50 text-red-700', label: 'Error' },
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`

  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

export default function ConnectionStatus({ status, lastCheckedAt, errorMessage }: Props) {
  const config = statusConfig[status]

  return (
    <div>
      <div className="flex items-center gap-2">
        <span className={`inline-block w-2.5 h-2.5 rounded-full ${config.color}`} />
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.bgColor}`}>
          {config.label}
        </span>
        {lastCheckedAt && (
          <span className="text-xs text-gray-400">
            {timeAgo(lastCheckedAt)}
          </span>
        )}
      </div>
      {status === 'error' && errorMessage && (
        <p className="mt-1 text-xs text-red-600">{errorMessage}</p>
      )}
    </div>
  )
}
