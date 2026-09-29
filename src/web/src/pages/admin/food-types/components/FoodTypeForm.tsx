import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/Button'
import { FormAlert } from '@/components/FormAlert'
import { SelectField } from '@/components/SelectField'
import { TextField } from '@/components/TextField'
import { showDuplicateNameErrors } from '@/lib/duplicateNameFields'
import { FoodTypeIcon, foodTypeIcons } from '@/lib/foodTypeIcons'
import { zodFormResolver } from '@/lib/zodFormResolver'
import {
  foodTypeFormSchema,
  toFoodTypeFormValues,
  type CreateFoodTypeBody,
  type FoodType,
  type FoodTypeFormInput,
} from '@/schemas/admin/food-types/foodTypeSchemas'

type FoodTypeFormProps = {
  foodType?: FoodType
  submitLabel: string
  onSubmit: (body: CreateFoodTypeBody) => Promise<unknown>
  onCancel: () => void
}

export function FoodTypeForm({
  foodType,
  submitLabel,
  onSubmit,
  onCancel,
}: FoodTypeFormProps) {
  const [submitFailed, setSubmitFailed] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting, submitCount },
  } = useForm<FoodTypeFormInput, unknown, CreateFoodTypeBody>({
    resolver: zodFormResolver(foodTypeFormSchema),
    defaultValues: toFoodTypeFormValues(foodType),
  })

  const submit = handleSubmit(async (body) => {
    setSubmitFailed(false)
    try {
      await onSubmit(body)
    } catch (error) {
      const isDuplicate = showDuplicateNameErrors(
        error,
        setError,
        'มีประเภทอาหารอื่นใช้ชื่อนี้แล้ว กรุณาใช้ชื่ออื่น',
      )
      setSubmitFailed(!isDuplicate)
    }
  })

  return (
    <form noValidate className="flex flex-col gap-4" onSubmit={submit}>
      {submitFailed ? (
        <FormAlert
          key={submitCount}
          message="บันทึกประเภทอาหารไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"
        />
      ) : null}
      <TextField
        id="food-type-name-th"
        label="ชื่อประเภทอาหารภาษาไทย"
        error={errors.nameTh?.message}
        {...register('nameTh')}
      />
      <TextField
        id="food-type-name-en"
        label="ชื่อประเภทอาหารภาษาอังกฤษ"
        error={errors.nameEn?.message}
        {...register('nameEn')}
      />
      <SelectField
        id="food-type-icon"
        label="ไอคอน (ไม่บังคับ)"
        hint="เลือกไอคอนจากชุดที่กำหนดไว้ หากไม่เลือก ระบบจะใช้ไอคอนเริ่มต้น"
        error={errors.icon?.message}
        adornment={
          <FoodTypeIcon
            icon={watch('icon') || null}
            aria-hidden
            size={32}
            className="shrink-0"
          />
        }
        {...register('icon')}
      >
        <option value="">ไม่เลือก (ใช้ไอคอนเริ่มต้น)</option>
        {foodTypeIcons.keys.map((key) => (
          <option key={key} value={key}>
            {foodTypeIcons.options[key].label} ({key})
          </option>
        ))}
      </SelectField>
      <TextField
        id="food-type-sort-order"
        label="ลำดับการแสดงผล"
        inputMode="numeric"
        error={errors.sortOrder?.message}
        {...register('sortOrder')}
      />
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel}>
          ยกเลิก
        </Button>
        <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? 'กำลังบันทึก…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
