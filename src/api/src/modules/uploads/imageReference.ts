import { z } from 'zod'

import { emptyTrimmedStringToNull } from '@/shared/validation'
import { uploadFileNameSchema } from './uploads.dto'

const LOCAL_IMAGE_URL_PREFIX = '/uploads/'

function isExternalHttpUrl(value: string) {
  return /^https?:\/\//i.test(value) && z.url().safeParse(value).success
}

// Image fields shared by Restaurant and MenuItem writes. A record points at either an
// external HTTP(S) URL with no key, or a generated upload key with its `/uploads/<key>` URL.
// imageUrl is one refined string so the OpenAPI contract stays `string | null`.
export const imageReferenceFields = {
  imageKey: z
    .preprocess(emptyTrimmedStringToNull, uploadFileNameSchema.nullable())
    .optional(),
  imageUrl: z
    .preprocess(
      emptyTrimmedStringToNull,
      z
        .string()
        .refine(
          (value) =>
            value.startsWith(LOCAL_IMAGE_URL_PREFIX) ||
            isExternalHttpUrl(value),
          'Must be an HTTP(S) URL or an uploaded image URL.',
        )
        .nullable(),
    )
    .optional(),
}

type ImageReferenceInput = {
  imageKey?: string | null | undefined
  imageUrl?: string | null | undefined
}

export function validateImageReference(
  { imageKey, imageUrl }: ImageReferenceInput,
  context: z.RefinementCtx,
) {
  if (imageKey !== undefined && imageUrl === undefined) {
    context.addIssue({
      code: 'custom',
      path: ['imageUrl'],
      message: 'imageUrl is required when imageKey is supplied.',
    })
    return
  }

  if (imageKey) {
    if (imageUrl !== `${LOCAL_IMAGE_URL_PREFIX}${imageKey}`) {
      context.addIssue({
        code: 'custom',
        path: ['imageUrl'],
        message: 'Local imageUrl must match imageKey.',
      })
    }
    return
  }

  if (imageUrl?.startsWith(LOCAL_IMAGE_URL_PREFIX)) {
    context.addIssue({
      code: 'custom',
      path: ['imageKey'],
      message: 'Local uploads require their generated imageKey.',
    })
  }
}

export function toImageReferenceCreateData(input: ImageReferenceInput) {
  return {
    imageKey: input.imageKey ?? null,
    imageUrl: input.imageUrl ?? null,
  }
}

// Both columns change together, and only when imageUrl is sent; an external URL always
// clears the key so it never keeps ownership of an earlier upload.
export function toImageReferenceUpdateData(input: ImageReferenceInput): {
  imageKey?: string | null
  imageUrl?: string | null
} {
  if (input.imageUrl === undefined) return {}

  return {
    imageUrl: input.imageUrl,
    imageKey: input.imageUrl?.startsWith(LOCAL_IMAGE_URL_PREFIX)
      ? (input.imageKey ?? null)
      : null,
  }
}
