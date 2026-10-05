import type { Ref } from 'react'

import { TasteIcon } from '@/lib/tasteIcons'
import type { Taste } from '@/schemas/admin/tastes/tasteSchemas'

type TasteCheckboxGroupProps = {
  tastes: Taste[]
  value: string[]
  onChange: (tasteIds: string[]) => void
  onBlur: () => void
  // Receives the first checkbox so a validation error can focus the group.
  inputRef: Ref<HTMLInputElement>
  error: string | undefined
}

const errorId = 'menu-item-tastes-error'

// Controlled checkboxes, so the value is always an array (React Hook Form would turn a
// single registered checkbox into a boolean). Each taste can appear only once.
export function TasteCheckboxGroup({
  tastes,
  value,
  onChange,
  onBlur,
  inputRef,
  error,
}: TasteCheckboxGroupProps) {
  function toggle(tasteId: string, checked: boolean) {
    const others = value.filter((id) => id !== tasteId)
    onChange(checked ? [...others, tasteId] : others)
  }

  return (
    <fieldset
      className="flex flex-col gap-2 rounded-sm border-2 border-line-soft p-3 aria-[invalid=true]:border-rust"
      aria-invalid={error ? true : undefined}
    >
      <legend className="px-1 font-bold">
        รสชาติ (เลือกอย่างน้อย 1 รายการ)
      </legend>
      {tastes.length === 0 ? (
        <p className="text-small text-muted">ยังไม่มีรสชาติในระบบ</p>
      ) : (
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {tastes.map((taste, index) => (
            <label key={taste.id} className="flex items-center gap-2">
              <input
                ref={index === 0 ? inputRef : undefined}
                type="checkbox"
                className="h-5 w-5 accent-paper"
                checked={value.includes(taste.id)}
                aria-describedby={error ? errorId : undefined}
                onChange={(event) => toggle(taste.id, event.target.checked)}
                onBlur={onBlur}
              />
              <TasteIcon
                aria-hidden
                icon={taste.icon}
                size={20}
                weight="bold"
              />
              {taste.name.th}
            </label>
          ))}
        </div>
      )}
      {error ? (
        <p id={errorId} className="text-small font-bold text-rust">
          {error}
        </p>
      ) : null}
    </fieldset>
  )
}
