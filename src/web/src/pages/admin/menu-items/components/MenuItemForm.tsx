import { useEffect, useState } from 'react'
import { Controller, useForm, type UseFormSetError } from 'react-hook-form'

import { ApiError } from '@/api/apiError'
import { Button } from '@/components/Button'
import { FormAlert } from '@/components/FormAlert'
import { ImageSourceField } from '@/components/ImageSourceField'
import { SelectField } from '@/components/SelectField'
import { TextField } from '@/components/TextField'
import { useFormImageUpload } from '@/hooks/admin/images/useFormImageUpload'
import type { ImageFormState } from '@/hooks/admin/images/useImageFormGuard'
import { zodFormResolver } from '@/lib/zodFormResolver'
import type { FoodType } from '@/schemas/admin/food-types/foodTypeSchemas'
import {
  menuItemFormSchema,
  toMenuItemFormValues,
  type CreateMenuItemBody,
  type MenuItem,
  type MenuItemFormInput,
} from '@/schemas/admin/menu-items/menuItemSchemas'
import type { Restaurant } from '@/schemas/admin/restaurants/restaurantSchemas'
import type { Taste } from '@/schemas/admin/tastes/tasteSchemas'
import { TasteCheckboxGroup } from './TasteCheckboxGroup'

type MenuItemFormProps = {
  menuItem?: MenuItem
  // Only active Restaurants can own a new or edited MenuItem.
  restaurants: Restaurant[]
  foodTypes: FoodType[]
  tastes: Taste[]
  optionsFailed: boolean
  submitLabel: string
  onSave: (
    body: CreateMenuItemBody,
    pendingUploadKey: string | null,
  ) => Promise<unknown>
  onCancel: () => void
  onStateChange: (state: ImageFormState) => void
}

const API_FIELDS: Record<string, keyof MenuItemFormInput> = {
  restaurantId: 'restaurantId',
  foodTypeId: 'foodTypeId',
  tasteIds: 'tasteIds',
  'name.th': 'nameTh',
  'name.en': 'nameEn',
  'description.th': 'descriptionTh',
  'description.en': 'descriptionEn',
  price: 'price',
  imageUrl: 'imageUrl',
  imageKey: 'uploadedImage',
}

// Errors the API reports against one field, with the message to show there.
const FIELD_ERRORS: Record<
  string,
  { field: keyof MenuItemFormInput; message: string }
> = {
  RESTAURANT_DELETED: {
    field: 'restaurantId',
    message: 'ร้านนี้ถูกลบแล้ว กรุณาเลือกร้านอื่นหรือกู้คืนร้านก่อน',
  },
  RESTAURANT_NOT_FOUND: {
    field: 'restaurantId',
    message: 'ไม่พบร้านนี้แล้ว กรุณาเลือกร้านใหม่',
  },
  FOOD_TYPE_NOT_FOUND: {
    field: 'foodTypeId',
    message: 'ไม่พบประเภทอาหารนี้แล้ว กรุณาเลือกใหม่',
  },
}

// Puts API errors on their fields where possible; returns the form-level message.
function showSaveError(
  reason: unknown,
  setError: UseFormSetError<MenuItemFormInput>,
) {
  if (!(reason instanceof ApiError)) {
    return 'บันทึกเมนูไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
  }
  const fieldError = FIELD_ERRORS[reason.code]
  if (fieldError) {
    setError(
      fieldError.field,
      { message: fieldError.message },
      { shouldFocus: true },
    )
    return null
  }
  if (reason.code === 'MENU_ITEM_NOT_FOUND') {
    return 'ไม่พบเมนูนี้แล้ว อาจถูกลบไปก่อนหน้านี้'
  }
  if (reason.status === 400) {
    Object.keys(reason.fields).forEach((field, index) => {
      const formField = API_FIELDS[field]
      if (formField) {
        setError(
          formField,
          {
            message:
              formField === 'tasteIds'
                ? 'มีรสชาติที่ไม่อยู่ในระบบแล้ว กรุณาเลือกใหม่'
                : 'ข้อมูลช่องนี้ไม่ถูกต้อง',
          },
          { shouldFocus: index === 0 },
        )
      }
    })
    return 'บันทึกเมนูไม่สำเร็จ กรุณาตรวจสอบข้อมูลที่ระบุ'
  }
  return 'บันทึกเมนูไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
}

export function MenuItemForm({
  menuItem,
  restaurants,
  foodTypes,
  tastes,
  optionsFailed,
  submitLabel,
  onSave,
  onCancel,
  onStateChange,
}: MenuItemFormProps) {
  const [defaults] = useState(() => toMenuItemFormValues(menuItem))
  const [formAlert, setFormAlert] = useState<string | null>(null)
  const form = useForm<MenuItemFormInput, unknown, CreateMenuItemBody>({
    resolver: zodFormResolver(menuItemFormSchema),
    defaultValues: defaults,
  })
  const {
    control,
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
      {optionsFailed ? (
        <FormAlert message="โหลดรายการร้าน ประเภทอาหาร หรือรสชาติไม่สำเร็จ กรุณาปิดแล้วลองใหม่อีกครั้ง" />
      ) : null}
      <SelectField
        id="menu-item-restaurant"
        label="ร้านอาหาร"
        hint="เลือกได้เฉพาะร้านที่ยังใช้งาน"
        error={errors.restaurantId?.message}
        {...register('restaurantId')}
      >
        <option value="">เลือกร้านอาหาร</option>
        {restaurants.map((restaurant) => (
          <option key={restaurant.id} value={restaurant.id}>
            {restaurant.name.th}
          </option>
        ))}
      </SelectField>
      <SelectField
        id="menu-item-food-type"
        label="ประเภทอาหาร"
        error={errors.foodTypeId?.message}
        {...register('foodTypeId')}
      >
        <option value="">เลือกประเภทอาหาร</option>
        {foodTypes.map((foodType) => (
          <option key={foodType.id} value={foodType.id}>
            {foodType.name.th}
          </option>
        ))}
      </SelectField>
      <Controller
        control={control}
        name="tasteIds"
        render={({ field, fieldState }) => (
          <TasteCheckboxGroup
            tastes={tastes}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            inputRef={field.ref}
            error={fieldState.error?.message}
          />
        )}
      />
      <TextField
        id="menu-item-name-th"
        label="ชื่อเมนูภาษาไทย"
        error={errors.nameTh?.message}
        {...register('nameTh')}
      />
      <TextField
        id="menu-item-name-en"
        label="ชื่อเมนูภาษาอังกฤษ"
        error={errors.nameEn?.message}
        {...register('nameEn')}
      />
      <TextField
        id="menu-item-description-th"
        label="คำอธิบายภาษาไทย (ไม่บังคับ)"
        error={errors.descriptionTh?.message}
        {...register('descriptionTh')}
      />
      <TextField
        id="menu-item-description-en"
        label="คำอธิบายภาษาอังกฤษ (ไม่บังคับ)"
        error={errors.descriptionEn?.message}
        {...register('descriptionEn')}
      />
      <TextField
        id="menu-item-price"
        inputMode="numeric"
        autoComplete="off"
        label="ราคา (บาท)"
        error={errors.price?.message}
        {...register('price')}
      />
      <ImageSourceField
        idPrefix="menu-item"
        subject="เมนู"
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
          disabled={busy || optionsFailed}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? 'กำลังบันทึก…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
