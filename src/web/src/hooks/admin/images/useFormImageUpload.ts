import { useEffect, useRef, useState } from 'react'
import type { FieldErrors } from 'react-hook-form'

import type { UploadedImage } from '@/schemas/shared/imageFields'
import { ImageSaveError } from './saveWithImageCleanup'
import {
  discardUploadedImage,
  ImageUploadError,
  useUploadImage,
} from './useImageUpload'

// The parts of a React Hook Form instance this hook writes to.
type ImageFormControls = {
  setValue: (
    name: 'uploadedImage',
    value: UploadedImage | null,
    options?: { shouldDirty?: boolean },
  ) => void
  clearErrors: (name: 'uploadedImage') => void
}

type UseFormImageUploadOptions = {
  form: ImageFormControls
  // The local image the saved record already uses; null for a new record or a URL image.
  savedImage: UploadedImage | null
  // The form's current `uploadedImage` value.
  uploadedImage: UploadedImage | null
}

// Upload state for an image form: picking a file uploads it at once so it can be previewed,
// and every upload the database will never reference is removed.
export function useFormImageUpload({
  form,
  savedImage,
  uploadedImage,
}: UseFormImageUploadOptions) {
  const upload = useUploadImage()
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isMounted = useRef(true)

  // An upload made in this form that the database does not reference yet.
  const pendingUploadKey =
    uploadedImage && uploadedImage.key !== savedImage?.key
      ? uploadedImage.key
      : null

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  async function uploadFile(file: File) {
    setUploadError(null)
    try {
      const image = await upload.mutateAsync(file)
      // The form closed while uploading, so nothing will ever reference this file.
      if (!isMounted.current) {
        void discardUploadedImage(image.key)
        return
      }
      // A replaced, never-saved upload would otherwise be orphaned.
      if (pendingUploadKey) void discardUploadedImage(pendingUploadKey)
      form.setValue('uploadedImage', image, { shouldDirty: true })
      form.clearErrors('uploadedImage')
    } catch (error) {
      setUploadError(
        error instanceof ImageUploadError
          ? error.message
          : 'อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
      )
    }
  }

  // The file input is not a registered field, so focus it when it is the only problem.
  function focusMissingUpload(fieldErrors: FieldErrors) {
    const fields = Object.keys(fieldErrors)
    if (fields.length === 1 && fields[0] === 'uploadedImage') {
      fileInputRef.current?.focus()
    }
  }

  // Applies a failed save's image outcome to the form and returns the underlying API error
  // plus any cleanup warning for the form alert.
  function handleSaveError(error: unknown) {
    if (!(error instanceof ImageSaveError)) {
      return { reason: error, cleanupWarning: null }
    }
    if (error.uploadDiscarded) {
      // The new upload was removed with the failed save; fall back to the saved image.
      form.setValue('uploadedImage', savedImage)
      if (!savedImage) {
        setUploadError(
          'รูปที่อัปโหลดถูกยกเลิกเพราะบันทึกไม่สำเร็จ กรุณาเลือกรูปอีกครั้ง',
        )
      }
    }
    return {
      reason: error.reason,
      cleanupWarning: error.cleanupFailed
        ? 'ระบบลบรูปที่อัปโหลดไว้ไม่สำเร็จ'
        : null,
    }
  }

  return {
    isUploading: upload.isPending,
    uploadError,
    pendingUploadKey,
    fileInputRef,
    uploadFile,
    focusMissingUpload,
    handleSaveError,
  }
}
