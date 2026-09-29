import { spawnSync } from 'node:child_process'
import { beforeAll, describe, expect, it, vi } from 'vitest'

const validEnv = {
  NODE_ENV: 'test',
  PORT: '3000',
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/kinraidee',
  JWT_SECRET: 'test-secret-that-is-at-least-32-characters',
  ARGON2_MEMORY_COST: '19456',
  ARGON2_TIME_COST: '2',
  ARGON2_PARALLELISM: '1',
  CORS_ALLOWED_ORIGINS:
    'https://app.example.com/, https://admin.example.com, https://app.example.com',
  LOCAL_UPLOADS_ENABLED: 'true',
  LOCAL_UPLOADS_DIRECTORY: '.local/uploads',
  LOCAL_UPLOAD_MAX_BYTES: '2097152',
} satisfies NodeJS.ProcessEnv

let parseEnv: typeof import('./env').parseEnv

beforeAll(async () => {
  for (const [name, value] of Object.entries(validEnv)) {
    vi.stubEnv(name, value)
  }

  ;({ parseEnv } = await import('./env'))
})

describe('parseEnv', () => {
  it('validates configuration and normalizes the CORS allowlist', () => {
    const env = parseEnv(validEnv)

    expect(env.CORS_ALLOWED_ORIGINS).toEqual([
      'https://app.example.com',
      'https://admin.example.com',
    ])
    expect(env.LOCAL_UPLOADS_ENABLED).toBe(true)
    expect(env.LOCAL_UPLOADS_DIRECTORY).toBe('.local/uploads')
    expect(env.LOCAL_UPLOAD_MAX_BYTES).toBe(2_097_152)
  })

  it('uses the approved local web origin when the allowlist is omitted', () => {
    const { CORS_ALLOWED_ORIGINS: _ignored, ...input } = validEnv

    expect(parseEnv(input).CORS_ALLOWED_ORIGINS).toEqual([
      'http://localhost:5173',
    ])
  })

  it.each([
    ['missing database URL', { ...validEnv, DATABASE_URL: '' }],
    ['short JWT secret', { ...validEnv, JWT_SECRET: 'too-short' }],
    ['invalid port', { ...validEnv, PORT: '0' }],
    ['wildcard CORS origin', { ...validEnv, CORS_ALLOWED_ORIGINS: '*' }],
    ['empty CORS allowlist', { ...validEnv, CORS_ALLOWED_ORIGINS: ' , ' }],
    [
      'CORS URL with a path',
      { ...validEnv, CORS_ALLOWED_ORIGINS: 'https://app.example.com/path' },
    ],
    [
      'invalid local-upload boolean',
      { ...validEnv, LOCAL_UPLOADS_ENABLED: 'yes' },
    ],
    [
      'production local uploads',
      { ...validEnv, NODE_ENV: 'production', LOCAL_UPLOADS_ENABLED: 'true' },
    ],
    ['invalid local-upload size', { ...validEnv, LOCAL_UPLOAD_MAX_BYTES: '0' }],
  ])('rejects %s', (_name, input) => {
    expect(() => parseEnv(input)).toThrow()
  })

  it('fails process startup when required configuration is invalid', () => {
    const { JWT_SECRET: _ignored, ...invalidProcessEnv } = {
      ...process.env,
      ...validEnv,
    }
    const result = spawnSync(
      process.execPath,
      ['--import', 'tsx', 'src/server.ts'],
      {
        cwd: process.cwd(),
        encoding: 'utf8',
        env: invalidProcessEnv,
        timeout: 5_000,
      },
    )

    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain('JWT_SECRET')
  })

  it('fails production startup when local uploads are enabled', () => {
    const result = spawnSync(
      process.execPath,
      ['--import', 'tsx', 'src/server.ts'],
      {
        cwd: process.cwd(),
        encoding: 'utf8',
        env: {
          ...process.env,
          ...validEnv,
          NODE_ENV: 'production',
          LOCAL_UPLOADS_ENABLED: 'true',
        },
        timeout: 5_000,
      },
    )

    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain('LOCAL_UPLOADS_ENABLED')
  })
})
