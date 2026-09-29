import { z } from 'zod'

import { HttpError } from '@/shared/httpError'

export const uploadFileNameSchema = z
  .string()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(?:jpg|png|webp)$/,
    'File name must be a generated image key.',
  )

export const uploadFileNameParameterSchema = z.object({
  fileName: uploadFileNameSchema,
})

export const uploadImageSchema = z.object({
  key: uploadFileNameSchema,
  url: z.string().startsWith('/uploads/'),
})

export const uploadImageEnvelopeSchema = z.object({
  data: z.object({ image: uploadImageSchema }),
})

export const uploadErrorEnvelopeSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    requestId: z.string(),
    fields: z.record(z.string(), z.string()).optional(),
  }),
})

export const uploadMultipartSchema = z.object({
  image: z.string().meta({ format: 'binary' }),
})

const uploadedImageInputSchema = z.object({
  buffer: z.instanceof(Buffer),
  mimeType: z.string().min(1),
  size: z.number().int().positive(),
})

export type UploadedImageInput = z.infer<typeof uploadedImageInputSchema>
export type UploadedImage = z.infer<typeof uploadImageSchema>

export function parseUploadedImage(file: Express.Multer.File | undefined) {
  if (!file) {
    throw new HttpError({
      status: 400,
      code: 'UPLOAD_REQUIRED',
      message: 'Exactly one image file is required.',
      fields: { image: 'Image is required.' },
    })
  }

  const result = uploadedImageInputSchema.safeParse({
    buffer: file.buffer,
    mimeType: file.mimetype,
    size: file.size,
  })
  if (result.success) return result.data

  throw new HttpError({
    status: 400,
    code: 'INVALID_UPLOAD',
    message: 'Upload must contain one non-empty image file.',
    fields: { image: 'Image must not be empty.' },
  })
}

export function parseUploadFileName(input: unknown) {
  const result = uploadFileNameParameterSchema.safeParse(input)
  if (result.success) return result.data.fileName

  throw new HttpError({
    status: 400,
    code: 'VALIDATION_ERROR',
    message: 'Invalid request.',
    fields: {
      fileName: result.error.issues[0]?.message ?? 'Invalid file name.',
    },
  })
}
