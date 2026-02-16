import { useState } from 'react'
import type { ConnectionFormData, ConnectionTestResult } from '../types'

interface Props {
  initialData?: Partial<ConnectionFormData>
  onSubmit: (data: ConnectionFormData) => Promise<void>
  onTest?: (data: ConnectionFormData) => Promise<ConnectionTestResult>
  isEdit?: boolean
  isLoading?: boolean
}

export default function ConnectionForm({ initialData, onSubmit, onTest, isEdit, isLoading }: Props) {
  const [form, setForm] = useState<ConnectionFormData>({
    name: initialData?.name ?? '',
    domain: initialData?.domain ?? '',
    bitrix_user_id: initialData?.bitrix_user_id ?? 1,
    webhook_code: '',
  })

  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null)
  const [testing, setTesting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: name === 'bitrix_user_id' ? parseInt(value) || 0 : value,
    }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    if (!form.name.trim()) newErrors.name = 'Name is required'
    if (!form.domain.trim()) newErrors.domain = 'Domain is required'
    if (!form.bitrix_user_id || form.bitrix_user_id < 1) newErrors.bitrix_user_id = 'User ID must be >= 1'
    if (!isEdit && !form.webhook_code.trim()) newErrors.webhook_code = 'Webhook code is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    await onSubmit(form)
  }

  async function handleTest() {
    if (!validate() || !onTest) return
    setTesting(true)
    setTestResult(null)
    try {
      const result = await onTest(form)
      setTestResult(result)
    } catch {
      setTestResult({ status: 'error', message: 'Test request failed. Check your network.' })
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
          placeholder="My Bitrix24"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="domain" className="block text-sm font-medium text-gray-700">
          Bitrix24 Domain
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
            https://
          </span>
          <input
            id="domain"
            name="domain"
            type="text"
            value={form.domain}
            onChange={handleChange}
            placeholder="company.bitrix24.com"
            className="block w-full rounded-r-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
          />
        </div>
        {errors.domain && <p className="mt-1 text-xs text-red-600">{errors.domain}</p>}
      </div>

      <div>
        <label htmlFor="bitrix_user_id" className="block text-sm font-medium text-gray-700">
          Webhook User ID
        </label>
        <input
          id="bitrix_user_id"
          name="bitrix_user_id"
          type="number"
          min={1}
          value={form.bitrix_user_id}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
        />
        <p className="mt-1 text-xs text-gray-500">ID of the user who created the webhook in Bitrix24</p>
        {errors.bitrix_user_id && <p className="mt-1 text-xs text-red-600">{errors.bitrix_user_id}</p>}
      </div>

      <div>
        <label htmlFor="webhook_code" className="block text-sm font-medium text-gray-700">
          Webhook Code {isEdit && <span className="text-gray-400">(leave empty to keep current)</span>}
        </label>
        <input
          id="webhook_code"
          name="webhook_code"
          type="password"
          value={form.webhook_code}
          onChange={handleChange}
          placeholder={isEdit ? '********' : 'Enter webhook secret code'}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
        />
        {errors.webhook_code && <p className="mt-1 text-xs text-red-600">{errors.webhook_code}</p>}
      </div>

      {testResult && (
        <div className={`rounded-md p-4 ${testResult.status === 'connected' ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {testResult.status === 'connected' ? (
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${testResult.status === 'connected' ? 'text-green-800' : 'text-red-800'}`}>
                {testResult.message}
              </p>
              {testResult.server_time && (
                <p className="mt-1 text-sm text-green-700">Server time: {testResult.server_time}</p>
              )}
              {testResult.scopes && testResult.scopes.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-green-700 font-medium">Available scopes:</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {testResult.scopes.map((scope) => (
                      <span
                        key={scope}
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          scope === 'task' ? 'bg-green-200 text-green-800' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
        </button>

        {onTest && (
          <button
            type="button"
            onClick={handleTest}
            disabled={testing}
            className="inline-flex justify-center rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500 disabled:opacity-50"
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </button>
        )}
      </div>
    </form>
  )
}
