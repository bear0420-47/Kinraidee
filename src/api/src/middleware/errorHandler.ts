import type { ErrorRequestHandler } from 'express'
import { HttpError } from '@/shared/httpError'

export const errorHandler: ErrorRequestHandler = (
  error,
  request,
  response,
  _next,
) => {
  if (error instanceof HttpError) {
    request.log.warn(
      { code: error.code, status: error.status, requestId: request.requestId },
      'Expected request error',
    )

    return response.status(error.status).json({
      error: {
        code: error.code,
        message: error.message,
        requestId: request.requestId,
        ...(error.fields ? { fields: error.fields } : {}),
      },
    })
  }

  request.log.error(
    { error, requestId: request.requestId },
    'Unhandled request error',
  )

  return response.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error.',
      requestId: request.requestId,
    },
  })
}
