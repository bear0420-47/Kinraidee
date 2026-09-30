import type { ReactNode, Ref, SelectHTMLAttributes } from 'react'

type SelectFieldProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> & {
  id: string
  label: string
  hint?: string
  error?: string | undefined
  // Decorative content beside the select, such as an icon preview.
  adornment?: ReactNode
  ref?: Ref<HTMLSelectElement>
}

export function SelectField({
  id,
  label,
  hint,
  error,
  adornment,
  children,
  ...selectProps
}: SelectFieldProps) {
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') ||
    undefined

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-bold">
        {label}
      </label>
      <div className="flex items-center gap-3">
        {adornment}
        <select
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className="min-h-12 w-full rounded-sm border-2 border-paper bg-surface px-3 text-body aria-[invalid=true]:border-rust aria-[invalid=true]:bg-peach-deep"
          {...selectProps}
        >
          {children}
        </select>
      </div>
      {hint ? (
        <p id={hintId} className="text-small text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-small font-bold text-rust">
          {error}
        </p>
      ) : null}
    </div>
  )
}
