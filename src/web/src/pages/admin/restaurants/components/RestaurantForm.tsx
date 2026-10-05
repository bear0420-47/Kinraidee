import { useEffect, useState } from 'react'
import { useForm, type UseFormSetError } from 'react-hook-form'

import { ApiError } from '@/api/apiError'
import { Button } from '@/components/Button'
import { FormAlert } from '@/components/FormAlert'
import { ImageSourceField } from '@/components/ImageSourceField'
import { SelectField } from '@/components/SelectField'
import { TextField } from '@/components/TextField'
import { useFormImageUpload } from '@/hooks/admin/images/useFormImageUpload'
import type { ImageFormState } from '@/hooks/admin/images/useImageFormGuard'
import { zodFormResolver } from '@/lib/zodFormResolver'
import {
  restaurantFormSchema,
  toRestaurantFormValues,
  type CreateRestaurantBody,
  type Restaurant,
  type RestaurantFormInput,
} from '@/schemas/admin/restaurants/restaurantSchemas'
import type { Zone } from '@/schemas/admin/zones/zoneSchemas'

type RestaurantFormProps = {
  restaurant?: Restaurant
  zones: Zone[]
  zonesFailed: boolean
  submitLabel: string
  onSave: (
    body: CreateRestaurantBody,
    pendingUploadKey: string | null,
  ) => Promise<unknown>
  onCancel: () => void
  onStateChange: (state: ImageFormState) => void
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
  zonesFailed,
  submitLabel,
  onSave,
  onCancel,
  onStateChange,
}: RestaurantFormProps) {
  const [defaults] = useState(() => toRestaurantFormValues(restaurant))
  const [formAlert, setFormAlert] = useState<string | null>(null)
  const form = useForm<RestaurantFormInput, unknown, CreateRestaurantBody>({
    resolver: zodFormResolver(restaurantFormSchema),
    defaultValues: defaults,
  })
  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting, isDirty, submitCount },
  } = form

  const imageMode = watch('imageMode')
  const externalUrl = watch('imageUrl')
  const uploadedImage = watch('uploadedImage')
  const image = useFormImageUpload({
    form,
    savedImage: defaults.uploadedImage,
    uploadedImage,
  })
  const { pendingUploadKey } = image

  const busy = isSubmitting || image.isUploading

  useEffect(() => {
    onStateChange({
      dirty: isDirty || pendingUploadKey !== null,
      pendingUploadKey,
      saving: isSubmitting,
      busy,
    })
  }, [isDirty, pendingUploadKey, isSubmitting, busy, onStateChange])

  const submit = handleSubmit(async (body) => {
    setFormAlert(null)
    try {
      await onSave(body, pendingUploadKey)
    } catch (error) {
      const { reason, cleanupWarning } = image.handleSaveError(error)
      const message = showSaveError(reason, setError)
      const alert = [message, cleanupWarning].filter(Boolean).join(' · ')
      setFormAlert(alert || null)
    }
  }, image.focusMissingUpload)

  return (
    <form noValidate className="flex flex-col gap-4" onSubmit={submit}>
      {formAlert ? <FormAlert key={submitCount} message={formAlert} /> : null}
      {zonesFailed ? (
        <FormAlert message="โหลดรายการโซนไม่สำเร็จ กรุณาปิดแล้วลองใหม่อีกครั้ง" />
      ) : null}
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
      <ImageSourceField
        idPrefix="restaurant"
        subject="ร้าน"
        register={register}
        mode={imageMode}
        externalUrl={externalUrl}
        urlError={errors.imageUrl?.message}
        uploadedImage={uploadedImage}
        uploadError={image.uploadError ?? errors.uploadedImage?.message}
        isUploading={image.isUploading}
        fileInputRef={image.fileInputRef}
        onFileSelected={(file) => void image.uploadFile(file)}
      />
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" disabled={busy} onClick={onCancel}>
          ยกเลิก
        </Button>
        <Button
          type="submit"
          disabled={busy || zonesFailed}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? 'กำลังบันทึก…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
