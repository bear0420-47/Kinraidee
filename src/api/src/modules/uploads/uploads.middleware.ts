import type { RequestHandler } from 'express'
import multer from 'multer'

import { env } from '@/config/env'
import { HttpError } from '@/shared/httpError'
import { uploadFileNameSchema } from './uploads.dto'

export function createRequireLocalUploadsEnabled(
  enabled = env.LOCAL_UPLOADS_ENABLED,
): RequestHandler {
  return (_request, _response, next) => {
    if (!enabled) {
      throw new HttpError({
        status: 503,
        code: 'UPLOAD_STORAGE_UNAVAILABLE',
        message: 'Local upload storage is unavailable.',
      })
    }

    return next()
  }
}

export function createUploadImageMiddleware(
  maxBytes = env.LOCAL_UPLOAD_MAX_BYTES,
): RequestHandler {
  const parseImage = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxBytes, files: 1, fields: 0, parts: 1 },
  }).single('image')

  return (request, response, next) => {
    parseImage(request, response, (error) => {
      if (!error) return next()
      if (!(error instanceof multer.MulterError)) return next(error)

      if (error.code === 'LIMIT_FILE_SIZE') {
        return next(
          new HttpError({
            status: 413,
            code: 'UPLOAD_TOO_LARGE',
            message: 'Image exceeds the configured size limit.',
            fields: { image: 'Image is too large.' },
          }),
        )
      }

      return next(
        new HttpError({
          status: 400,
          code: 'INVALID_UPLOAD',
          message: 'Upload must contain exactly one image file.',
          fields: { image: 'Exactly one image file is allowed.' },
        }),
      )
    })
  }
}

export const requireGeneratedUploadPath: RequestHandler = (
  request,
  response,
  next,
) => {
  const fileName = request.path.slice(1)
  if (!uploadFileNameSchema.safeParse(fileName).success) {
    return response.sendStatus(404)
  }

  return next()
}

export const requireLocalUploadsEnabled: RequestHandler =
  createRequireLocalUploadsEnabled()
export const uploadImageMiddleware: RequestHandler =
  createUploadImageMiddleware()
