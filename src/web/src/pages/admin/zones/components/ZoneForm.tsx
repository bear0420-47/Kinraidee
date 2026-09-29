import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/Button'
import { FormAlert } from '@/components/FormAlert'
import { TextField } from '@/components/TextField'
import { showDuplicateNameErrors } from '@/lib/duplicateNameFields'
import { zodFormResolver } from '@/lib/zodFormResolver'
import {
  toZoneFormValues,
  zoneFormSchema,
  type CreateZoneBody,
  type Zone,
  type ZoneFormInput,
} from '@/schemas/admin/zones/zoneSchemas'

type ZoneFormProps = {
  zone?: Zone
  submitLabel: string
  onSubmit: (body: CreateZoneBody) => Promise<unknown>
  onCancel: () => void
}

export function ZoneForm({
  zone,
  submitLabel,
  onSubmit,
  onCancel,
}: ZoneFormProps) {
  const [submitFailed, setSubmitFailed] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, submitCount },
  } = useForm<ZoneFormInput, unknown, CreateZoneBody>({
    resolver: zodFormResolver(zoneFormSchema),
    defaultValues: toZoneFormValues(zone),
  })

  const submit = handleSubmit(async (body) => {
    setSubmitFailed(false)
    try {
      await onSubmit(body)
    } catch (error) {
      const isDuplicate = showDuplicateNameErrors(
        error,
        setError,
        'มีโซนอื่นใช้ชื่อนี้แล้ว กรุณาใช้ชื่ออื่น',
      )
      setSubmitFailed(!isDuplicate)
    }
  })

  return (
    <form noValidate className="flex flex-col gap-4" onSubmit={submit}>
      {submitFailed ? (
        <FormAlert
          key={submitCount}
          message="บันทึกโซนไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"
        />
      ) : null}
      <TextField
        id="zone-name-th"
        label="ชื่อโซนภาษาไทย"
        error={errors.nameTh?.message}
        {...register('nameTh')}
      />
      <TextField
        id="zone-name-en"
        label="ชื่อโซนภาษาอังกฤษ"
        error={errors.nameEn?.message}
        {...register('nameEn')}
      />
      <TextField
        id="zone-description-th"
        label="คำอธิบายภาษาไทย (ไม่บังคับ)"
        error={errors.descriptionTh?.message}
        {...register('descriptionTh')}
      />
      <TextField
        id="zone-description-en"
        label="คำอธิบายภาษาอังกฤษ (ไม่บังคับ)"
        error={errors.descriptionEn?.message}
        {...register('descriptionEn')}
      />
      <TextField
        id="zone-sort-order"
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
