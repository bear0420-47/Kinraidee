import { spawnSync } from 'node:child_process'
import { createServer, type AddressInfo } from 'node:net'
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
    expect(env.GEMINI_MODEL).toBe('gemini-3.5-flash-lite')
    expect(env.EXTERNAL_PROVIDER_TIMEOUT_MS).toBe(5_000)
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
    [
      'provider timeout above the approved maximum',
      { ...validEnv, EXTERNAL_PROVIDER_TIMEOUT_MS: '5001' },
    ],
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

  it('fails startup instead of reporting it is listening when the port is taken', async () => {
    const blocker = createServer()
    await new Promise<void>((resolve) => blocker.listen(0, resolve))
    const { port } = blocker.address() as AddressInfo

    try {
      const result = spawnSync(
        process.execPath,
        ['--import', 'tsx', 'src/server.ts'],
        {
          cwd: process.cwd(),
          encoding: 'utf8',
          env: { ...process.env, ...validEnv, PORT: String(port) },
          timeout: 5_000,
        },
      )

      expect(result.status).not.toBe(0)
      expect(result.stderr).toContain('EADDRINUSE')
      expect(result.stdout).not.toContain('Kinraidee API listening')
    } finally {
      await new Promise((resolve) => blocker.close(resolve))
    }
  })
})

describe('parseEnv security rules', () => {
  const production = {
    ...validEnv,
    NODE_ENV: 'production',
    LOCAL_UPLOADS_ENABLED: 'false',
  }

  it.each([
    'replace-with-at-least-32-characters',
    'test-secret-that-is-at-least-32-characters',
    'please-CHANGE-ME-before-deploying-this-app',
  ])('refuses the placeholder JWT_SECRET %s in production', (secret) => {
    expect(() => parseEnv({ ...production, JWT_SECRET: secret })).toThrow(
      /JWT_SECRET must be a unique random secret/,
    )
  })

  it('accepts a random JWT_SECRET in production', () => {
    expect(
      parseEnv({
        ...production,
        JWT_SECRET: 'q8Vt3mZ1xW9pL2rK7sN4bF6hJ0cD5gYa',
      }).JWT_SECRET,
    ).toHaveLength(32)
  })

  it('defaults TRUST_PROXY to 0 and accepts a hop count', () => {
    expect(parseEnv(validEnv).TRUST_PROXY).toBe(0)
    expect(parseEnv({ ...validEnv, TRUST_PROXY: '1' }).TRUST_PROXY).toBe(1)
    expect(parseEnv({ ...validEnv, TRUST_PROXY: 'true' }).TRUST_PROXY).toBe(
      true,
    )
    expect(() => parseEnv({ ...validEnv, TRUST_PROXY: 'yes' })).toThrow()
    expect(() => parseEnv({ ...validEnv, TRUST_PROXY: '-1' })).toThrow()
  })
})
