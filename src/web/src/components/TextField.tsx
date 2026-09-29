import type { InputHTMLAttributes, Ref } from 'react'

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  id: string
  label: string
  error?: string | undefined
  ref?: Ref<HTMLInputElement>
}

export function TextField({ id, label, error, ...inputProps }: TextFieldProps) {
  const errorId = `${id}-error`

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-bold">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="min-h-12 rounded-sm border-2 border-paper bg-surface px-3 text-body aria-[invalid=true]:border-rust aria-[invalid=true]:bg-peach-deep"
        {...inputProps}
      />
      {error ? (
        <p id={errorId} className="text-small font-bold text-rust">
          {error}
        </p>
      ) : null}
    </div>
  )
}
