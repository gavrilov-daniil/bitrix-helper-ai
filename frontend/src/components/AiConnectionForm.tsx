import { useState } from 'react'
import type { AiConnectionFormData, AiProvider, ConnectionTestResult } from '../types'

const PROVIDERS: { value: AiProvider; label: string }[] = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic (Claude)' },
]

const DEFAULT_MODELS: Record<AiProvider, string> = {
  openai: 'gpt-4o',
  anthropic: 'claude-sonnet-4-5-20250929',
}

interface Props {
  initialData?: Partial<AiConnectionFormData>
  onSubmit: (data: AiConnectionFormData) => Promise<void>
  onTest?: () => Promise<ConnectionTestResult>
  isEdit?: boolean
  isLoading?: boolean
}

export default function AiConnectionForm({ initialData, onSubmit, onTest, isEdit, isLoading }: Props) {
  const [form, setForm] = useState<AiConnectionFormData>({
    name: initialData?.name ?? '',
    provider: initialData?.provider ?? 'openai',
    api_key: '',
    model: initialData?.model ?? DEFAULT_MODELS.openai,
    priority: initialData?.priority ?? 1,
    is_active: initialData?.is_active ?? true,
  })

  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null)
  const [testing, setTesting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setForm((prev) => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked
          : name === 'priority' ? parseInt(value) || 1
          : value,
      }

      // Auto-set default model when provider changes
      if (name === 'provider' && !isEdit) {
        updated.model = DEFAULT_MODELS[value as AiProvider] ?? prev.model
      }

      return updated
    })
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    if (!form.name.trim()) newErrors.name = 'Name is required'
    if (!form.provider) newErrors.provider = 'Provider is required'
    if (!isEdit && !form.api_key.trim()) newErrors.api_key = 'API key is required'
    if (!form.model.trim()) newErrors.model = 'Model is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    await onSubmit(form)
  }

  async function handleTest() {
    if (!onTest) return
    setTesting(true)
    setTestResult(null)
    try {
      const result = await onTest()
      setTestResult(result)
    } catch {
      setTestResult({ status: 'error', message: 'Test request failed.' })
    } finally {
      setTesting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Connection Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          placeholder="My OpenAI"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="provider" className="block text-sm font-medium text-gray-700">
          Provider
        </label>
        <select
          id="provider"
          name="provider"
          value={form.provider}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
        >
          {PROVIDERS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
        {errors.provider && <p className="mt-1 text-xs text-red-600">{errors.provider}</p>}
      </div>

      <div>
        <label htmlFor="api_key" className="block text-sm font-medium text-gray-700">
          API Key {isEdit && <span className="text-gray-400">(leave empty to keep current)</span>}
        </label>
        <input
          id="api_key"
          name="api_key"
          type="password"
          value={form.api_key}
          onChange={handleChange}
          placeholder={isEdit ? '********' : 'Enter API key'}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
        />
        {errors.api_key && <p className="mt-1 text-xs text-red-600">{errors.api_key}</p>}
      </div>

      <div>
        <label htmlFor="model" className="block text-sm font-medium text-gray-700">
          Model
        </label>
        <input
          id="model"
          name="model"
          type="text"
          value={form.model}
          onChange={handleChange}
          placeholder="gpt-4o"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
        />
        <p className="mt-1 text-xs text-gray-500">
          {form.provider === 'openai' ? 'e.g. gpt-4o, gpt-4o-mini' : 'e.g. claude-sonnet-4-5-20250929, claude-haiku-4-5-20251001'}
        </p>
        {errors.model && <p className="mt-1 text-xs text-red-600">{errors.model}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
            Priority
          </label>
          <input
            id="priority"
            name="priority"
            type="number"
            min={1}
            max={100}
            value={form.priority}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
          />
          <p className="mt-1 text-xs text-gray-500">Lower = tried first (fallback order)</p>
        </div>

        <div className="flex items-center pt-6">
          <input
            id="is_active"
            name="is_active"
            type="checkbox"
            checked={form.is_active}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
            Active
          </label>
        </div>
      </div>

      {testResult && (
        <div className={`rounded-md p-4 ${testResult.status === 'connected' ? 'bg-green-50' : 'bg-red-50'}`}>
          <p className={`text-sm font-medium ${testResult.status === 'connected' ? 'text-green-800' : 'text-red-800'}`}>
            {testResult.message}
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
        </button>

        {onTest && (
          <button
            type="button"
            onClick={handleTest}
            disabled={testing}
            className="inline-flex justify-center rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-200 disabled:opacity-50"
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </button>
        )}
      </div>
    </form>
  )
}
