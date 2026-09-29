import type { RequestHandler } from 'express'

import { created, noContent } from '@/shared/httpResponse'
import { parseUploadedImage, parseUploadFileName } from './uploads.dto'
import { uploadsService, type UploadsService } from './uploads.service'

export type UploadsController = {
  uploadImage: RequestHandler
  deleteImage: RequestHandler
}

export function createUploadsController(
  service: UploadsService = uploadsService,
): UploadsController {
  const uploadImage: RequestHandler = async (request, response) => {
    const image = await service.storeImage(parseUploadedImage(request.file))
    return created(response, { image })
  }

  const deleteImage: RequestHandler = async (request, response) => {
    await service.deleteImage(parseUploadFileName(request.params))
    return noContent(response)
  }

  return { uploadImage, deleteImage }
}

export const uploadsController = createUploadsController()
