import type { components } from '@/api/openapiTypes'

type ErrorEnvelope = components['schemas']['ErrorEnvelope']

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly fields: Record<string, string>

  constructor(status: number, envelope?: ErrorEnvelope) {
    super(envelope?.error.message ?? 'Request failed.')
    this.name = 'ApiError'
    this.status = status
    this.code = envelope?.error.code ?? 'UNKNOWN_ERROR'
    this.fields = envelope?.error.fields ?? {}
  }
}
