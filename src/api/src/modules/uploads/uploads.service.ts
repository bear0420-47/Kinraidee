import { randomUUID } from 'node:crypto'
import { mkdir, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileTypeFromBuffer } from 'file-type'

import { env } from '@/config/env'
import { HttpError } from '@/shared/httpError'
import type { UploadedImage, UploadedImageInput } from './uploads.dto'

const supportedImageTypes = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
])

type UploadsServiceOptions = {
  rootDirectory?: string
  maxBytes?: number
}

export function createUploadsService({
  rootDirectory = path.resolve(process.cwd(), env.LOCAL_UPLOADS_DIRECTORY),
  maxBytes = env.LOCAL_UPLOAD_MAX_BYTES,
}: UploadsServiceOptions = {}) {
  const uploadRoot = path.resolve(rootDirectory)

  return {
    async storeImage(input: UploadedImageInput): Promise<UploadedImage> {
      if (input.size > maxBytes) throw uploadTooLargeError()

      const expectedExtension = supportedImageTypes.get(input.mimeType)
      if (!expectedExtension) throw unsupportedImageError()

      const detected = await fileTypeFromBuffer(input.buffer)
      const detectedExtension = detected
        ? supportedImageTypes.get(detected.mime)
        : undefined

      if (!detected || !detectedExtension) throw unsupportedImageError()
      if (
        detected.mime !== input.mimeType ||
        detectedExtension !== expectedExtension
      ) {
        throw new HttpError({
          status: 400,
          code: 'UPLOAD_MIME_MISMATCH',
          message: 'Declared image type does not match file content.',
          fields: { image: 'Image content does not match its MIME type.' },
        })
      }

      const key = `${randomUUID()}.${detectedExtension}`
      const targetPath = resolveInsideRoot(uploadRoot, key)

      await mkdir(uploadRoot, { recursive: true })
      await writeFile(targetPath, input.buffer, { flag: 'wx' })

      return { key, url: `/uploads/${key}` }
    },

    async deleteImage(fileName: string): Promise<void> {
      const targetPath = resolveInsideRoot(uploadRoot, fileName)

      try {
        await unlink(targetPath)
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
          throw new HttpError({
            status: 404,
            code: 'UPLOAD_NOT_FOUND',
            message: 'Upload not found.',
          })
        }

        throw error
      }
    },
  }
}

function resolveInsideRoot(rootDirectory: string, fileName: string) {
  const targetPath = path.resolve(rootDirectory, fileName)
  if (path.dirname(targetPath) !== rootDirectory) {
    throw new HttpError({
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'Invalid request.',
      fields: {
        fileName: 'File name must remain inside the upload directory.',
      },
    })
  }

  return targetPath
}

function uploadTooLargeError() {
  return new HttpError({
    status: 413,
    code: 'UPLOAD_TOO_LARGE',
    message: 'Image exceeds the configured size limit.',
    fields: { image: 'Image is too large.' },
  })
}

function unsupportedImageError() {
  return new HttpError({
    status: 415,
    code: 'UPLOAD_UNSUPPORTED_TYPE',
    message: 'Only JPEG, PNG, and WebP images are supported.',
    fields: { image: 'Unsupported image type.' },
  })
}

export const uploadsService = createUploadsService()
export type UploadsService = ReturnType<typeof createUploadsService>
