import type { ErrorRequestHandler } from 'express'
import { HttpError } from '@/shared/httpError'

function toBodyParserError(error: unknown) {
  if (!error || typeof error !== 'object') return null
  const { type, status, expose } = error as {
    type?: unknown
    status?: unknown
    expose?: unknown
  }
  if (typeof type !== 'string' || expose !== true) return null
  if (typeof status !== 'number' || status < 400 || status >= 500) return null

  if (type === 'entity.too.large') {
    return {
      status: 413,
      code: 'PAYLOAD_TOO_LARGE',
      message: 'Request body is too large.',
    }
  }

  return {
    status: 400,
    code: 'INVALID_REQUEST_BODY',
    message: 'Request body could not be read.',
  }
}

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

  // body-parser marks client mistakes (bad JSON, body too large) with a 4xx status
  // and `expose`; answer those as client errors without echoing parser details.
  const bodyError = toBodyParserError(error)
  if (bodyError) {
    request.log.warn(
      {
        code: bodyError.code,
        status: bodyError.status,
        requestId: request.requestId,
      },
      'Rejected request body',
    )
    return response.status(bodyError.status).json({
      error: {
        code: bodyError.code,
        message: bodyError.message,
        requestId: request.requestId,
      },
    })
  }

  request.log.error(
    {
      errorType: error instanceof Error ? error.name : 'UnknownError',
      requestId: request.requestId,
    },
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
