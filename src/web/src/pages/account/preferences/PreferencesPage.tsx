import { Eraser, FloppyDisk } from '@phosphor-icons/react'
import { useEffect, useId, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'

import { ApiError } from '@/api/apiError'
import { Button } from '@/components/Button'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { FormAlert } from '@/components/FormAlert'
import { PageShell } from '@/components/PageShell'
import { SelectField } from '@/components/SelectField'
import { useFoodTypes } from '@/hooks/admin/food-types/useFoodTypes'
import { useTastes } from '@/hooks/admin/tastes/useTastes'
import { useZones } from '@/hooks/admin/zones/useZones'
import {
  useClearPreference,
  usePreference,
  useSavePreference,
} from '@/hooks/preferences/usePreference'
import { zodFormResolver } from '@/lib/zodFormResolver'
import type { FoodType } from '@/schemas/admin/food-types/foodTypeSchemas'
import type { Taste } from '@/schemas/admin/tastes/tasteSchemas'
import type { Zone } from '@/schemas/admin/zones/zoneSchemas'
import {
  ANY_LABEL,
  ANY_ZONE_LABEL,
  budgetOptions,
} from '@/schemas/meal/recommendationSchemas'
import {
  ANY_CHOICE,
  NOT_SET,
  NOT_SET_LABEL,
  preferenceFormSchema,
  toPreferenceFormValues,
  type Preference,
  type PreferenceFormInput,
} from '@/schemas/preferences/preferenceSchemas'

const masterFields = ['tasteId', 'foodTypeId', 'zoneId'] as const

// The fields a failed save named as unknown records, for example deleted by an admin.
function staleFieldsOf(error: unknown) {
  return error instanceof ApiError && error.status === 400
    ? masterFields.filter((field) => field in error.fields)
    : []
}

// One saved set of default conditions for the meal flow. Every field may be left without a
// default; clearing removes the saved set after confirmation.
export function PreferencesPage() {
  const preference = usePreference()
  const tastes = useTastes()
  const foodTypes = useFoodTypes()
  const zones = useZones()
  const queries = [preference, tastes, foodTypes, zones]

  return (
    <PageShell title="ค่าเริ่มต้นการสุ่มเมนู" width="medium">
      <Link to="/account" className="self-start rounded-xs font-bold underline">
        กลับไปบัญชีของฉัน
      </Link>
      {queries.some((query) => query.isError) ? (
        <div role="alert" className="flex flex-col items-start gap-3">
          <p className="font-bold text-rust">
            โหลดค่าเริ่มต้นไม่สำเร็จ กรุณาลองใหม่อีกครั้ง
          </p>
          <Button
            variant="secondary"
            onClick={() => queries.forEach((query) => void query.refetch())}
          >
            ลองใหม่
          </Button>
        </div>
      ) : preference.isSuccess &&
        tastes.isSuccess &&
        foodTypes.isSuccess &&
        zones.isSuccess ? (
        <PreferenceForm
          saved={preference.data}
          tastes={tastes.data}
          foodTypes={foodTypes.data}
          zones={zones.data}
          onStaleOptions={() => {
            void tastes.refetch()
            void foodTypes.refetch()
            void zones.refetch()
          }}
        />
      ) : (
        <p role="status">กำลังโหลดค่าเริ่มต้น…</p>
      )}
    </PageShell>
  )
}

type PreferenceFormProps = {
  saved: Preference | null
  tastes: Taste[]
  foodTypes: FoodType[]
  zones: Zone[]
  // A save named a record that no longer exists, so the option lists are out of date.
  onStaleOptions: () => void
}

function PreferenceForm({
  saved,
  tastes,
  foodTypes,
  zones,
  onStaleOptions,
}: PreferenceFormProps) {
  const save = useSavePreference()
  const clear = useClearPreference()
  const [status, setStatus] = useState('')
  const [confirmingClear, setConfirmingClear] = useState(false)
  // After clearing, the dialog returns focus to the clear button just before it is disabled,
  // so focus is moved to the save button explicitly once nothing is saved.
  const [focusSave, setFocusSave] = useState(false)
  const saveButtonRef = useRef<HTMLButtonElement>(null)
  const notSetId = useId()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    setFocus,
    formState: { errors },
  } = useForm<PreferenceFormInput, unknown, Preference>({
    resolver: zodFormResolver(preferenceFormSchema),
    defaultValues: toPreferenceFormValues(saved),
  })

  function submit(body: Preference) {
    setStatus('')
    save.mutate(body, {
      onSuccess: () => setStatus('บันทึกค่าเริ่มต้นแล้ว'),
      onError: (error) => {
        // An unknown ID: mark each field the API named and move to the first one.
        const stale = staleFieldsOf(error)
        if (stale.length === 0) return
        for (const field of stale) {
          setError(field, {
            message: 'ตัวเลือกนี้ไม่มีในระบบแล้ว กรุณาเลือกใหม่',
          })
        }
        setFocus(stale[0]!)
        onStaleOptions()
      },
    })
  }

  useEffect(() => {
    if (!focusSave || saved) return
    saveButtonRef.current?.focus()
    setFocusSave(false)
  }, [focusSave, saved])

  async function clearSaved() {
    await clear.mutateAsync()
    setConfirmingClear(false)
    setFocusSave(true)
    reset(toPreferenceFormValues(null))
    setStatus('ล้างค่าเริ่มต้นแล้ว')
  }

  // Field errors explain stale choices; any other failure gets the general alert.
  const failedSave = save.error && staleFieldsOf(save.error).length === 0

  return (
    <>
      {saved ? null : <p id={notSetId}>ยังไม่ได้ตั้งค่าเริ่มต้น</p>}
      {failedSave ? (
        <FormAlert
          key={save.submittedAt}
          message="บันทึกค่าเริ่มต้นไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"
        />
      ) : null}
      <p role="status" className="sr-only">
        {status}
      </p>
      <form
        noValidate
        className="flex flex-col gap-4"
        onSubmit={handleSubmit(submit)}
      >
        <SelectField
          id="preference-budget"
          label="งบประมาณ"
          error={errors.budget?.message}
          {...register('budget')}
        >
          <option value={NOT_SET}>{NOT_SET_LABEL}</option>
          {budgetOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
        <SelectField
          id="preference-taste"
          label="รสชาติ"
          error={errors.tasteId?.message}
          {...register('tasteId')}
        >
          <option value={NOT_SET}>{NOT_SET_LABEL}</option>
          <option value={ANY_CHOICE}>{ANY_LABEL}</option>
          {tastes.map((taste) => (
            <option key={taste.id} value={taste.id}>
              {taste.name.th}
            </option>
          ))}
        </SelectField>
        <SelectField
          id="preference-food-type"
          label="ประเภทอาหาร"
          error={errors.foodTypeId?.message}
          {...register('foodTypeId')}
        >
          <option value={NOT_SET}>{NOT_SET_LABEL}</option>
          <option value={ANY_CHOICE}>{ANY_LABEL}</option>
          {foodTypes.map((foodType) => (
            <option key={foodType.id} value={foodType.id}>
              {foodType.name.th}
            </option>
          ))}
        </SelectField>
        <SelectField
          id="preference-zone"
          label="พื้นที่"
          error={errors.zoneId?.message}
          {...register('zoneId')}
        >
          <option value={NOT_SET}>{NOT_SET_LABEL}</option>
          <option value={ANY_CHOICE}>{ANY_ZONE_LABEL}</option>
          {zones.map((zone) => (
            <option key={zone.id} value={zone.id}>
              {zone.name.th}
            </option>
          ))}
        </SelectField>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {/* Always shown so it can be found; with nothing saved it is disabled, and the
              "not set" line above says why. */}
          <Button
            variant="secondary"
            disabled={!saved}
            aria-describedby={saved ? undefined : notSetId}
            onClick={() => setConfirmingClear(true)}
          >
            <Eraser aria-hidden weight="bold" />
            ล้างค่าเริ่มต้น
          </Button>
          <Button
            ref={saveButtonRef}
            type="submit"
            disabled={save.isPending}
            aria-busy={save.isPending}
          >
            <FloppyDisk aria-hidden weight="bold" />
            {save.isPending ? 'กำลังบันทึก…' : 'บันทึกค่าเริ่มต้น'}
          </Button>
        </div>
      </form>
      {confirmingClear ? (
        <ConfirmDialog
          title="ล้างค่าเริ่มต้น?"
          confirmLabel="ล้างค่าเริ่มต้น"
          pendingLabel="กำลังล้าง…"
          icon={<Eraser aria-hidden weight="bold" />}
          getErrorMessage={() =>
            'ล้างค่าเริ่มต้นไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
          }
          onConfirm={clearSaved}
          onClose={() => setConfirmingClear(false)}
        >
          <p>
            ค่าเริ่มต้นที่บันทึกไว้จะถูกลบ ขั้นตอนเลือกมื้อจะไม่เลือกค่าใดไว้ให้
          </p>
        </ConfirmDialog>
      ) : null}
    </>
  )
}
