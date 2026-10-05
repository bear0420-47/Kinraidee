import { useEffect, useRef, useState } from 'react'
import {
  useForm,
  type FieldErrors,
  type UseFormSetError,
} from 'react-hook-form'

import { ApiError } from '@/api/apiError'
import { Button } from '@/components/Button'
import { FormAlert } from '@/components/FormAlert'
import { SelectField } from '@/components/SelectField'
import { TextField } from '@/components/TextField'
import {
  discardUploadedImage,
  ImageUploadError,
  useUploadRestaurantImage,
} from '@/hooks/admin/restaurants/useRestaurantImage'
import { RestaurantSaveError } from '@/hooks/admin/restaurants/useRestaurants'
import { zodFormResolver } from '@/lib/zodFormResolver'
import {
  restaurantFormSchema,
  toRestaurantFormValues,
  type CreateRestaurantBody,
  type Restaurant,
  type RestaurantFormInput,
} from '@/schemas/admin/restaurants/restaurantSchemas'
import type { Zone } from '@/schemas/admin/zones/zoneSchemas'
import { RestaurantImageField } from './RestaurantImageField'

export type UnsavedRestaurantState = {
  dirty: boolean
  // An upload made in this form that the database does not reference yet.
  pendingUploadKey: string | null
}

type RestaurantFormProps = {
  restaurant?: Restaurant
  zones: Zone[]
  submitLabel: string
  onSave: (
    body: CreateRestaurantBody,
    pendingUploadKey: string | null,
  ) => Promise<unknown>
  onCancel: () => void
  onUnsavedChange: (state: UnsavedRestaurantState) => void
}

const API_FIELDS: Record<string, keyof RestaurantFormInput> = {
  zoneId: 'zoneId',
  'name.th': 'nameTh',
  'name.en': 'nameEn',
  'description.th': 'descriptionTh',
  'description.en': 'descriptionEn',
  phone: 'phone',
  imageUrl: 'imageUrl',
  imageKey: 'uploadedImage',
}

// Puts API errors on their fields where possible; returns the form-level message.
function showSaveError(
  reason: unknown,
  setError: UseFormSetError<RestaurantFormInput>,
) {
  if (reason instanceof ApiError && reason.code === 'ZONE_NOT_FOUND') {
    setError(
      'zoneId',
      { message: 'ไม่พบโซนนี้แล้ว กรุณาเลือกโซนใหม่' },
      { shouldFocus: true },
    )
    return null
  }
  if (reason instanceof ApiError && reason.code === 'RESTAURANT_NOT_FOUND') {
    return 'ไม่พบร้านนี้แล้ว อาจถูกลบไปก่อนหน้านี้'
  }
  if (reason instanceof ApiError && reason.status === 400) {
    Object.keys(reason.fields).forEach((field, index) => {
      const formField = API_FIELDS[field]
      if (formField) {
        setError(
          formField,
          { message: 'ข้อมูลช่องนี้ไม่ถูกต้อง' },
          { shouldFocus: index === 0 },
        )
      }
    })
    return 'บันทึกร้านอาหารไม่สำเร็จ กรุณาตรวจสอบข้อมูลที่ระบุ'
  }
  return 'บันทึกร้านอาหารไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
}

export function RestaurantForm({
  restaurant,
  zones,
  submitLabel,
  onSave,
  onCancel,
  onUnsavedChange,
}: RestaurantFormProps) {
  const [defaults] = useState(() => toRestaurantFormValues(restaurant))
  const [formAlert, setFormAlert] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const upload = useUploadRestaurantImage()
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    clearErrors,
    watch,
    formState: { errors, isSubmitting, isDirty, submitCount },
  } = useForm<RestaurantFormInput, unknown, CreateRestaurantBody>({
    resolver: zodFormResolver(restaurantFormSchema),
    defaultValues: defaults,
  })

  const imageMode = watch('imageMode')
  const externalUrl = watch('imageUrl')
  const uploadedImage = watch('uploadedImage')
  const savedImageKey = restaurant?.imageKey ?? null
  const pendingUploadKey =
    uploadedImage && uploadedImage.key !== savedImageKey
      ? uploadedImage.key
      : null

  useEffect(() => {
    onUnsavedChange({
      dirty: isDirty || pendingUploadKey !== null,
      pendingUploadKey,
    })
  }, [isDirty, pendingUploadKey, onUnsavedChange])

  async function uploadFile(file: File) {
    setUploadError(null)
    try {
      const image = await upload.mutateAsync(file)
      // A replaced, never-saved upload would otherwise be orphaned.
      if (pendingUploadKey) void discardUploadedImage(pendingUploadKey)
      setValue('uploadedImage', image, { shouldDirty: true })
      clearErrors('uploadedImage')
    } catch (error) {
      setUploadError(
        error instanceof ImageUploadError
          ? error.message
          : 'อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
      )
    }
  }

  function focusMissingUpload(fieldErrors: FieldErrors<RestaurantFormInput>) {
    // The file input is not a registered field, so focus it when it is the only problem.
    const fields = Object.keys(fieldErrors)
    if (fields.length === 1 && fields[0] === 'uploadedImage') {
      fileInputRef.current?.focus()
    }
  }

  const submit = handleSubmit(async (body) => {
    setFormAlert(null)
    try {
      await onSave(body, pendingUploadKey)
    } catch (error) {
      const saveError = error instanceof RestaurantSaveError ? error : null
      if (saveError?.uploadDiscarded) {
        // The new upload was removed with the failed save; fall back to the saved image.
        setValue('uploadedImage', defaults.uploadedImage)
        if (!defaults.uploadedImage) {
          setUploadError(
            'รูปที่อัปโหลดถูกยกเลิกเพราะบันทึกไม่สำเร็จ กรุณาเลือกรูปอีกครั้ง',
          )
        }
      }
      const message = showSaveError(saveError?.reason ?? error, setError)
      const cleanupWarning = saveError?.cleanupFailed
        ? 'ระบบลบรูปที่อัปโหลดไว้ไม่สำเร็จ'
        : null
      const alert = [message, cleanupWarning].filter(Boolean).join(' · ')
      setFormAlert(alert || null)
    }
  }, focusMissingUpload)

  return (
    <form noValidate className="flex flex-col gap-4" onSubmit={submit}>
      {formAlert ? <FormAlert key={submitCount} message={formAlert} /> : null}
      <SelectField
        id="restaurant-zone"
        label="โซน"
        error={errors.zoneId?.message}
        {...register('zoneId')}
      >
        <option value="">เลือกโซน</option>
        {zones.map((zone) => (
          <option key={zone.id} value={zone.id}>
            {zone.name.th}
          </option>
        ))}
      </SelectField>
      <TextField
        id="restaurant-name-th"
        label="ชื่อร้านภาษาไทย"
        error={errors.nameTh?.message}
        {...register('nameTh')}
      />
      <TextField
        id="restaurant-name-en"
        label="ชื่อร้านภาษาอังกฤษ"
        error={errors.nameEn?.message}
        {...register('nameEn')}
      />
      <TextField
        id="restaurant-description-th"
        label="คำอธิบายภาษาไทย (ไม่บังคับ)"
        error={errors.descriptionTh?.message}
        {...register('descriptionTh')}
      />
      <TextField
        id="restaurant-description-en"
        label="คำอธิบายภาษาอังกฤษ (ไม่บังคับ)"
        error={errors.descriptionEn?.message}
        {...register('descriptionEn')}
      />
      <TextField
        id="restaurant-phone"
        type="tel"
        autoComplete="off"
        label="เบอร์โทรร้าน (ไม่บังคับ)"
        error={errors.phone?.message}
        {...register('phone')}
      />
      <RestaurantImageField
        register={register}
        mode={imageMode}
        externalUrl={externalUrl}
        urlError={errors.imageUrl?.message}
        uploadedImage={uploadedImage}
        uploadError={uploadError ?? errors.uploadedImage?.message}
        isUploading={upload.isPending}
        fileInputRef={fileInputRef}
        onFileSelected={(file) => void uploadFile(file)}
      />
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel}>
          ยกเลิก
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || upload.isPending}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? 'กำลังบันทึก…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
