import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

const testEnv = {
  NODE_ENV: 'test',
  PORT: '3000',
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/kinraidee',
  JWT_SECRET: 'test-secret-that-is-at-least-32-characters',
  CORS_ALLOWED_ORIGINS: 'http://localhost:5173',
  LOCAL_UPLOADS_ENABLED: 'true',
  LOCAL_UPLOADS_DIRECTORY: '.local/uploads',
  LOCAL_UPLOAD_MAX_BYTES: '2097152',
}

const samples = {
  jpg: {
    mimeType: 'image/jpeg',
    buffer: Buffer.from(
      'ffd8ffe000104a46494600010100000100010000ffdb00040000ffd9',
      'hex',
    ),
  },
  png: {
    mimeType: 'image/png',
    buffer: Buffer.from(
      '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000049454e44ae426082',
      'hex',
    ),
  },
  webp: {
    mimeType: 'image/webp',
    buffer: Buffer.from(
      '524946461200000057454250565038200600000000000000000000',
      'hex',
    ),
  },
}

let createUploadsService: typeof import('./uploads.service').createUploadsService
const temporaryDirectories: string[] = []

beforeAll(async () => {
  for (const [name, value] of Object.entries(testEnv)) vi.stubEnv(name, value)
  ;({ createUploadsService } = await import('./uploads.service'))
})

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  )
})

async function createTestService(maxBytes = 2_097_152) {
  const rootDirectory = await mkdtemp(path.join(os.tmpdir(), 'kinraidee-'))
  temporaryDirectories.push(rootDirectory)
  return {
    rootDirectory,
    service: createUploadsService({ rootDirectory, maxBytes }),
  }
}

describe('uploads service', () => {
  it.each(Object.entries(samples))(
    'stores detected %s content under a generated key',
    async (extension, sample) => {
      const { rootDirectory, service } = await createTestService()
      const image = await service.storeImage({
        ...sample,
        size: sample.buffer.length,
      })

      expect(image.key).toMatch(
        new RegExp(
          `^[0-9a-f-]{36}\\.${extension === 'jpg' ? 'jpg' : extension}$`,
        ),
      )
      expect(image.url).toBe(`/uploads/${image.key}`)
      await expect(
        readFile(path.join(rootDirectory, image.key)),
      ).resolves.toEqual(sample.buffer)
    },
  )

  it('rejects MIME spoofing, unsupported content, and oversized input', async () => {
    const { service } = await createTestService(samples.png.buffer.length)

    await expect(
      service.storeImage({
        buffer: samples.png.buffer,
        mimeType: 'image/jpeg',
        size: samples.png.buffer.length,
      }),
    ).rejects.toMatchObject({ status: 400, code: 'UPLOAD_MIME_MISMATCH' })

    for (const input of [
      { buffer: Buffer.from('<svg></svg>'), mimeType: 'image/svg+xml' },
      { buffer: Buffer.from('GIF89a'), mimeType: 'image/gif' },
      { buffer: Buffer.from('<html></html>'), mimeType: 'text/html' },
    ]) {
      await expect(
        service.storeImage({ ...input, size: input.buffer.length }),
      ).rejects.toMatchObject({
        status: 415,
        code: 'UPLOAD_UNSUPPORTED_TYPE',
      })
    }

    await expect(
      service.storeImage({
        ...samples.png,
        size: samples.png.buffer.length + 1,
      }),
    ).rejects.toMatchObject({ status: 413, code: 'UPLOAD_TOO_LARGE' })
  })

  it('deletes only generated files and returns 404 when absent', async () => {
    const { rootDirectory, service } = await createTestService()
    const fileName = '123e4567-e89b-42d3-a456-426614174000.webp'
    const filePath = path.join(rootDirectory, fileName)
    await writeFile(filePath, samples.webp.buffer)

    await service.deleteImage(fileName)
    await expect(access(filePath)).rejects.toMatchObject({ code: 'ENOENT' })
    await expect(service.deleteImage(fileName)).rejects.toMatchObject({
      status: 404,
      code: 'UPLOAD_NOT_FOUND',
    })
  })
})
