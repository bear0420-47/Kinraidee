import { useMutation } from '@tanstack/react-query'

import { apiClient } from '@/api/client'
import type { UploadedImage } from '@/schemas/shared/imageFields'

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024

const TYPE_MESSAGE = 'รองรับเฉพาะไฟล์ JPEG, PNG หรือ WebP'
const SIZE_MESSAGE = 'ไฟล์รูปต้องมีขนาดไม่เกิน 2 MB'

// Carries a user-facing Thai message; never includes file paths or server details.
export class ImageUploadError extends Error {}

// Fast client feedback only; the API re-checks the real file type and size.
export function getImageFileError(file: File) {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return TYPE_MESSAGE
  if (file.size > MAX_IMAGE_BYTES) return SIZE_MESSAGE
  return null
}

function getUploadErrorMessage(status: number, code: string | undefined) {
  if (status === 413 || code === 'UPLOAD_TOO_LARGE') return SIZE_MESSAGE
  if (status === 415 || code === 'UPLOAD_MIME_MISMATCH') return TYPE_MESSAGE
  if (status === 503) return 'ระบบอัปโหลดรูปไม่พร้อมใช้งานในขณะนี้'
  return 'อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
}

async function uploadImage(file: File): Promise<UploadedImage> {
  const fileError = getImageFileError(file)
  if (fileError) throw new ImageUploadError(fileError)

  const { data, error, response } = await apiClient.POST(
    '/api/uploads/images',
    {
      // The contract types the binary part as a string; the File itself goes out as multipart.
      body: { image: file.name },
      bodySerializer: () => {
        const form = new FormData()
        form.append('image', file)
        return form
      },
    },
  )
  if (!data) {
    throw new ImageUploadError(
      getUploadErrorMessage(response.status, error?.error.code),
    )
  }
  return data.data.image
}

// Best-effort removal of an internally uploaded file; true when the file is gone.
export async function discardUploadedImage(key: string) {
  try {
    const { response } = await apiClient.DELETE(
      '/api/uploads/images/{fileName}',
      { params: { path: { fileName: key } } },
    )
    return response.ok || response.status === 404
  } catch {
    return false
  }
}

export function useUploadImage() {
  return useMutation({ mutationFn: uploadImage })
}
