export type HttpErrorOptions = {
  status: number
  code: string
  message: string
  fields?: Record<string, string>
}

export class HttpError extends Error {
  readonly status: number
  readonly code: string
  readonly fields: Record<string, string> | undefined

  constructor({ status, code, message, fields }: HttpErrorOptions) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.code = code
    this.fields = fields
  }
}
