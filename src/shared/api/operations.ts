import { api } from './client'
import { request } from './envelope'
import type { DataEnvelope } from './envelope'

export type OperationStatus =
  'QUEUED' | 'RUNNING' | 'NEEDS_INPUT' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED'

export type Operation = {
  id: string
  type: string
  applicationId: string | null
  status: OperationStatus
  progress: number | null
  result: unknown
  error: { code: string; message: string; retryable: boolean } | null
  inputRequest: {
    code: string
    message: string
    fields: { name: string; label: string; type: 'TEXT' | 'FILE' }[]
  } | null
  createdAt: string
  updatedAt: string
}

export const getOperation = async (id: string): Promise<Operation> => {
  const env = await request<DataEnvelope<Operation>>(() => api.get(`operations/${id}`))
  return env.data
}

const TERMINAL: Operation['status'][] = ['SUCCEEDED', 'FAILED', 'CANCELLED', 'NEEDS_INPUT']

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

export const waitForOperation = async (
  id: string,
  options: { intervalMs?: number; timeoutMs?: number } = {},
): Promise<Operation> => {
  const intervalMs = options.intervalMs ?? 1_000
  const timeoutMs = options.timeoutMs ?? 60_000
  const deadline = Date.now() + timeoutMs
  for (;;) {
    const operation = await getOperation(id)
    if (TERMINAL.includes(operation.status)) return operation
    if (Date.now() >= deadline) return operation
    await sleep(intervalMs)
  }
}
