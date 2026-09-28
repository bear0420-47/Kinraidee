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
    const cyclic: unknown[] = []
    cyclic.push(cyclic)

    testLogger.info({
      cyclic,
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
      user: {
        profile: {
          email: 'deep@example.com',
          apiKey: 'deep-api-key',
          clientSecret: 'deep-client-secret',
          jwt: 'deep-jwt',
        },
        sessions: [
          { accessToken: 'array-token', sessionId: 'private-session' },
        ],
      },
    })

    expect(output).toContain('"path":"/login"')
    expect(output).toContain('[Circular]')
    expect(output).not.toContain('user@example.com')
    expect(output).not.toContain('deep@example.com')
    expect(output).not.toContain('deep-api-key')
    expect(output).not.toContain('deep-client-secret')
    expect(output).not.toContain('deep-jwt')
    expect(output).not.toContain('array-token')
    expect(output).not.toContain('private-session')
    expect(output).not.toContain('password-secret')
    expect(output).not.toContain('token-secret')
    expect(output).not.toContain('query-secret')
    expect(output).not.toContain('Bearer secret')
    expect(output).not.toContain('jwt=secret')
    expect(output).not.toContain('19.123,99.123')
  })
})
