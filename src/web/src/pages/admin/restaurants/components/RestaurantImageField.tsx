import type { Ref } from 'react'
import type { UseFormRegister } from 'react-hook-form'

import { TextField } from '@/components/TextField'
import { ACCEPTED_IMAGE_TYPES } from '@/hooks/admin/restaurants/useRestaurantImage'
import {
  isHttpImageUrl,
  type ImageMode,
  type RestaurantFormInput,
  type UploadedImage,
} from '@/schemas/admin/restaurants/restaurantSchemas'
import { ImagePreview } from './ImagePreview'

type RestaurantImageFieldProps = {
  register: UseFormRegister<RestaurantFormInput>
  mode: ImageMode
  externalUrl: string
  urlError: string | undefined
  uploadedImage: UploadedImage | null
  // Missing-file error from validation, or a rejected/failed upload.
  uploadError: string | undefined
  isUploading: boolean
  fileInputRef: Ref<HTMLInputElement>
  onFileSelected: (file: File) => void
}

const modeLabels: Record<ImageMode, string> = {
  none: 'ไม่มีรูป',
  url: 'ใช้ URL รูปภาพ',
  upload: 'อัปโหลดรูปจากเครื่อง',
}

// Local uploads exist only in development/test; production builds never render the control.
export function RestaurantImageField({
  register,
  mode,
  externalUrl,
  urlError,
  uploadedImage,
  uploadError,
  isUploading,
  fileInputRef,
  onFileSelected,
}: RestaurantImageFieldProps) {
  const modes: ImageMode[] = import.meta.env.DEV
    ? ['none', 'url', 'upload']
    : ['none', 'url']
  const uploadErrorId = 'restaurant-image-file-error'

  return (
    <fieldset className="flex flex-col gap-3 rounded-sm border-2 border-line-soft p-3">
      <legend className="px-1 font-bold">รูปร้าน (ไม่บังคับ)</legend>
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {modes.map((value) => (
          <label key={value} className="flex items-center gap-2">
            <input
              type="radio"
              value={value}
              className="h-5 w-5 accent-paper"
              {...register('imageMode')}
            />
            {modeLabels[value]}
          </label>
        ))}
      </div>

      {mode === 'url' ? (
        <>
          <TextField
            id="restaurant-image-url"
            type="url"
            inputMode="url"
            label="URL รูปภาพ"
            placeholder="https://"
            error={urlError}
            {...register('imageUrl')}
          />
          {/* Preview only a URL that passes validation; the image is never proxied. */}
          {isHttpImageUrl(externalUrl) ? (
            <ImagePreview
              url={externalUrl}
              alt="ตัวอย่างรูปร้านจาก URL"
              size="preview"
            />
          ) : null}
        </>
      ) : null}

      {/* The build flag is inlined, so production bundles drop this block entirely. */}
      {import.meta.env.DEV && mode === 'upload' ? (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="restaurant-image-file" className="font-bold">
            เลือกไฟล์รูป (JPEG, PNG หรือ WebP ไม่เกิน 2 MB)
          </label>
          <input
            ref={fileInputRef}
            id="restaurant-image-file"
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(',')}
            disabled={isUploading}
            aria-invalid={uploadError ? true : undefined}
            aria-describedby={uploadError ? uploadErrorId : undefined}
            className="text-small file:mr-3 file:min-h-11 file:rounded-pill file:border-2 file:border-paper file:bg-surface file:px-4 file:font-bold"
            onChange={(event) => {
              const file = event.target.files?.[0]
              // Reset so choosing the same file again still triggers an upload.
              event.target.value = ''
              if (file) onFileSelected(file)
            }}
          />
          <p role="status" className="text-small">
            {isUploading
              ? 'กำลังอัปโหลดรูป…'
              : uploadedImage
                ? 'อัปโหลดรูปแล้ว'
                : ''}
          </p>
          {uploadError ? (
            <p
              id={uploadErrorId}
              role="alert"
              className="text-small font-bold text-rust"
            >
              {uploadError}
            </p>
          ) : null}
          {uploadedImage ? (
            <ImagePreview
              url={uploadedImage.url}
              alt="ตัวอย่างรูปร้านที่อัปโหลด"
              size="preview"
            />
          ) : null}
        </div>
      ) : null}
    </fieldset>
  )
}
