import { Writable } from 'node:stream'
import pino from 'pino'
import { beforeAll, describe, expect, it, vi } from 'vitest'

let loggerOptions: typeof import('./logger').loggerOptions
let serializeError: typeof import('./logger').serializeError
let serializeRequest: typeof import('./logger').serializeRequest
let serializeResponse: typeof import('./logger').serializeResponse

beforeAll(async () => {
  vi.stubEnv('NODE_ENV', 'test')
  vi.stubEnv(
    'DATABASE_URL',
    'postgresql://postgres:postgres@localhost:5432/kinraidee',
  )
  vi.stubEnv('JWT_SECRET', 'test-secret-that-is-at-least-32-characters')

  ;({ loggerOptions, serializeError, serializeRequest, serializeResponse } =
    await import('./logger'))
})

describe('safe HTTP log serializers', () => {
  it('keeps only safe request fields and strips the query string', () => {
    expect(
      serializeRequest({
        id: 'req_12345678',
        method: 'POST',
        url: '/login?email=user@example.com&token=secret',
      }),
    ).toEqual({
      id: 'req_12345678',
      method: 'POST',
      path: '/login',
    })
  })

  it('keeps only response status and error type', () => {
    expect(
      serializeResponse({ statusCode: 500, headers: { cookie: 'secret' } }),
    ).toEqual({ statusCode: 500 })
    expect(
      serializeError({
        type: 'Error',
        message: 'user@example.com token=secret',
        stack: 'private stack',
      }),
    ).toEqual({ type: 'Error' })
  })

  it('redacts secrets and personal data from emitted logs', () => {
    let output = ''
    const destination = new Writable({
      write(chunk, _encoding, callback) {
        output += chunk.toString()
        callback()
      },
    })
    const testLogger = pino({ ...loggerOptions, level: 'info' }, destination)

    testLogger.info({
      req: {
        method: 'POST',
        url: '/login?email=user@example.com&token=query-secret',
        headers: { authorization: 'Bearer secret', cookie: 'jwt=secret' },
        body: { password: 'password-secret' },
      },
      email: 'user@example.com',
      password: 'password-secret',
      token: 'token-secret',
      rawGps: '19.123,99.123',
      user: { email: 'nested@example.com', token: 'nested-token' },
    })

    expect(output).toContain('"path":"/login"')
    expect(output).not.toContain('user@example.com')
    expect(output).not.toContain('nested@example.com')
    expect(output).not.toContain('password-secret')
    expect(output).not.toContain('token-secret')
    expect(output).not.toContain('query-secret')
    expect(output).not.toContain('Bearer secret')
    expect(output).not.toContain('jwt=secret')
    expect(output).not.toContain('19.123,99.123')
  })
})
