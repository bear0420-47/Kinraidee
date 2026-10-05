import { z } from 'zod'

// Image form fields shared by the Restaurant and MenuItem forms. Exactly one image source is
// active, and it becomes the API's imageKey/imageUrl pair (see `toImageBody`).
export const imageModes = ['none', 'url', 'upload'] as const
export type ImageMode = (typeof imageModes)[number]

export type UploadedImage = { key: string; url: string }

// The stored image of a Restaurant or MenuItem.
export type ImageReference = {
  imageKey: string | null
  imageUrl: string | null
}

export function isHttpImageUrl(value: string) {
  return /^https?:\/\//i.test(value) && z.url().safeParse(value).success
}

export const imageFormFields = {
  imageMode: z.enum(imageModes),
  imageUrl: z.string().trim(),
  uploadedImage: z.object({ key: z.string(), url: z.string() }).nullable(),
}

export type ImageFormValues = {
  imageMode: ImageMode
  imageUrl: string
  uploadedImage: UploadedImage | null
}

export function checkImageSource(
  { imageMode, imageUrl, uploadedImage }: ImageFormValues,
  context: z.RefinementCtx,
) {
  if (imageMode === 'url' && !imageUrl) {
    context.addIssue({
      code: 'custom',
      path: ['imageUrl'],
      message: 'กรุณากรอก URL รูปภาพ',
    })
  } else if (imageMode === 'url' && !isHttpImageUrl(imageUrl)) {
    context.addIssue({
      code: 'custom',
      path: ['imageUrl'],
      message: 'URL รูปภาพต้องขึ้นต้นด้วย http:// หรือ https://',
    })
  }

  if (imageMode === 'upload' && !uploadedImage) {
    context.addIssue({
      code: 'custom',
      path: ['uploadedImage'],
      message: 'กรุณาเลือกรูปเพื่ออัปโหลด',
    })
  }
}

export function toImageBody({
  imageMode,
  imageUrl,
  uploadedImage,
}: ImageFormValues): ImageReference {
  if (imageMode === 'url') return { imageKey: null, imageUrl }
  if (imageMode === 'upload' && uploadedImage) {
    return { imageKey: uploadedImage.key, imageUrl: uploadedImage.url }
  }
  return { imageKey: null, imageUrl: null }
}

export function toImageFormValues(record?: ImageReference): ImageFormValues {
  const imageKey = record?.imageKey ?? null
  const imageUrl = record?.imageUrl ?? null

  return {
    imageMode: imageKey ? 'upload' : imageUrl ? 'url' : 'none',
    imageUrl: imageKey ? '' : (imageUrl ?? ''),
    uploadedImage:
      imageKey && imageUrl ? { key: imageKey, url: imageUrl } : null,
  }
}

// The image change for a PATCH; the key and URL always travel together.
export function getImageChange(
  record: ImageReference,
  body: Partial<ImageReference>,
): ImageReference | null {
  const imageKey = body.imageKey ?? null
  const imageUrl = body.imageUrl ?? null
  return imageKey !== record.imageKey || imageUrl !== record.imageUrl
    ? { imageKey, imageUrl }
    : null
}
