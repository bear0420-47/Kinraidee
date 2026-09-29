import { HttpError } from '@/shared/httpError'

export function uploadTooLargeError() {
  return new HttpError({
    status: 413,
    code: 'UPLOAD_TOO_LARGE',
    message: 'Image exceeds the configured size limit.',
    fields: { image: 'Image is too large.' },
  })
}
