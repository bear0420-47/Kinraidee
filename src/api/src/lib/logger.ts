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

const sensitiveLogKeyParts = [
  'apikey',
  'buffer',
  'credential',
  'email',
  'encryptionkey',
  'filename',
  'imagecontent',
  'jwt',
  'originalname',
  'password',
  'privatekey',
  'rawgps',
  'secret',
  'sessionid',
  'signingkey',
  'token',
]

function isSensitiveLogKey(key: string) {
  const normalizedKey = key.replaceAll(/[-_]/g, '').toLowerCase()

  return (
    sensitiveLogKeyParts.some((part) => normalizedKey.includes(part)) ||
    ['authorization', 'body', 'cookie', 'query'].includes(normalizedKey)
  )
}

function sanitizeLogValue(value: unknown, seen: WeakSet<object>): unknown {
  if (value instanceof Error) {
    return { type: value.name }
  }

  if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) {
    return '[Redacted binary data]'
  }

  if (!value || typeof value !== 'object' || value instanceof Date) {
    return value
  }

  if (seen.has(value)) return '[Circular]'
  seen.add(value)

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeLogValue(item, seen))
  }

  const sanitized: Record<string, unknown> = {}
  for (const [key, nestedValue] of Object.entries(value)) {
    if (!isSensitiveLogKey(key)) {
      sanitized[key] = sanitizeLogValue(nestedValue, seen)
    }
  }

  return sanitized
}

export function sanitizeLogObject(log: Record<string, unknown>) {
  const sanitized: Record<string, unknown> = {}
  const seen = new WeakSet<object>()

  for (const [key, value] of Object.entries(log)) {
    if (isSensitiveLogKey(key)) continue

    sanitized[key] = ['req', 'res', 'err'].includes(key)
      ? value
      : sanitizeLogValue(value, seen)
  }

  return sanitized
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

export const httpSerializers = {
  req: serializeRequest,
  res: serializeResponse,
  err: serializeError,
}

export const loggerOptions: LoggerOptions = {
  level: env.NODE_ENV === 'test' ? 'silent' : 'info',
  ...(env.NODE_ENV === 'development'
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            ignore: 'pid,hostname',
            translateTime: 'SYS:standard',
          },
        },
      }
    : {}),
  formatters: {
    log: sanitizeLogObject,
  },
  serializers: httpSerializers,
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
