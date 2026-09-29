import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/Button'
import { FormAlert } from '@/components/FormAlert'
import { SelectField } from '@/components/SelectField'
import { TextField } from '@/components/TextField'
import { showDuplicateNameErrors } from '@/lib/duplicateNameFields'
import type { IconRegistry } from '@/lib/iconRegistry'
import { zodFormResolver } from '@/lib/zodFormResolver'
import {
  createIconMasterDataFormSchema,
  toIconMasterDataFormValues,
  type IconMasterData,
  type IconMasterDataFormInput,
} from '@/schemas/shared/iconMasterDataSchemas'

type IconMasterDataFormProps = {
  // Prefix for field ids, such as `food-type`.
  idPrefix: string
  // Thai entity name used in labels and messages, such as `ประเภทอาหาร`.
  entityLabel: string
  registry: IconRegistry
  record?: IconMasterData | undefined
  submitLabel: string
  onSubmit: (body: IconMasterData) => Promise<unknown>
  onCancel: () => void
}

// Shared create/edit form for FoodType and Taste: localized name, registry icon, sortOrder.
export function IconMasterDataForm({
  idPrefix,
  entityLabel,
  registry,
  record,
  submitLabel,
  onSubmit,
  onCancel,
}: IconMasterDataFormProps) {
  const [submitFailed, setSubmitFailed] = useState(false)
  const [schema] = useState(() => createIconMasterDataFormSchema(registry))
  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting, submitCount },
  } = useForm<IconMasterDataFormInput, unknown, IconMasterData>({
    resolver: zodFormResolver(schema),
    defaultValues: toIconMasterDataFormValues(registry, record),
  })
  const PreviewIcon = registry.resolve(watch('icon') || null)

  const submit = handleSubmit(async (body) => {
    setSubmitFailed(false)
    try {
      await onSubmit(body)
    } catch (error) {
      const isDuplicate = showDuplicateNameErrors(
        error,
        setError,
        `มี${entityLabel}อื่นใช้ชื่อนี้แล้ว กรุณาใช้ชื่ออื่น`,
      )
      setSubmitFailed(!isDuplicate)
    }
  })

  return (
    <form noValidate className="flex flex-col gap-4" onSubmit={submit}>
      {submitFailed ? (
        <FormAlert
          key={submitCount}
          message={`บันทึก${entityLabel}ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง`}
        />
      ) : null}
      <TextField
        id={`${idPrefix}-name-th`}
        label={`ชื่อ${entityLabel}ภาษาไทย`}
        error={errors.nameTh?.message}
        {...register('nameTh')}
      />
      <TextField
        id={`${idPrefix}-name-en`}
        label={`ชื่อ${entityLabel}ภาษาอังกฤษ`}
        error={errors.nameEn?.message}
        {...register('nameEn')}
      />
      <SelectField
        id={`${idPrefix}-icon`}
        label="ไอคอน (ไม่บังคับ)"
        hint="เลือกไอคอนจากชุดที่กำหนดไว้ หากไม่เลือก ระบบจะใช้ไอคอนเริ่มต้น"
        error={errors.icon?.message}
        adornment={<PreviewIcon aria-hidden size={32} className="shrink-0" />}
        {...register('icon')}
      >
        <option value="">ไม่เลือก (ใช้ไอคอนเริ่มต้น)</option>
        {registry.keys.map((key) => (
          <option key={key} value={key}>
            {registry.labelOf(key)} ({key})
          </option>
        ))}
      </SelectField>
      <TextField
        id={`${idPrefix}-sort-order`}
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
