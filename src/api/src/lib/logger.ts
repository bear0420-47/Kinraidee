import pino, { type LoggerOptions } from 'pino'
import { env } from '@/config/env'

type SerializedRequest = {
  [key: string]: unknown
  id?: unknown
  method?: unknown
  url?: unknown
}

type SerializedResponse = {
  [key: string]: unknown
  statusCode?: unknown
}

type SerializedError = {
  [key: string]: unknown
  name?: unknown
  type?: unknown
}

export function serializeRequest(request: SerializedRequest) {
  return {
    id: request.id,
    method: request.method,
    path:
      typeof request.url === 'string'
        ? request.url.split('?', 1)[0]
        : undefined,
  }
}

export function serializeResponse(response: SerializedResponse) {
  return { statusCode: response.statusCode }
}

export function serializeError(error: SerializedError) {
  return {
    type:
      typeof error.type === 'string'
        ? error.type
        : typeof error.name === 'string'
          ? error.name
          : 'Error',
  }
}

export const loggerOptions: LoggerOptions = {
  level: env.NODE_ENV === 'test' ? 'silent' : 'info',
  serializers: {
    req: serializeRequest,
    res: serializeResponse,
    err: serializeError,
  },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body',
      'req.query',
      'password',
      '*.password',
      'token',
      '*.token',
      'email',
      '*.email',
      'rawGps',
      '*.rawGps',
    ],
    remove: true,
  },
}

export const logger = pino(loggerOptions)
