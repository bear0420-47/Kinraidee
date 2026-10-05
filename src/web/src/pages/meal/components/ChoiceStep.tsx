import { ArrowLeft, ArrowRight } from '@phosphor-icons/react'
import { useId, useState, type ReactNode, type Ref } from 'react'

import { Button } from '@/components/Button'

export type ChoiceOption = {
  // Master-data ID, budget value, or `ANY_CHOICE` for the UI-only "any" option.
  value: string
  label: string
  icon?: ReactNode
}

// Radio value of the "any" option. Master-data IDs are never empty, so it cannot collide.
export const ANY_CHOICE = ''

// A stored master-data condition (`null` = any, undefined = unanswered) as a radio value.
export function toChoiceValue(id: string | null | undefined) {
  return id === null ? ANY_CHOICE : id
}

export function fromChoiceValue(value: string) {
  return value === ANY_CHOICE ? null : value
}

export function loadStateOf(query: { isPending: boolean; isError: boolean }) {
  return query.isPending ? 'loading' : query.isError ? 'error' : 'ready'
}

type ChoiceStepProps = {
  number: number
  title: string
  hint: string
  name: string
  options: ChoiceOption[]
  // The chosen option value, or undefined while unanswered.
  value: string | undefined
  missingMessage: string
  headingRef: Ref<HTMLHeadingElement>
  // Master data for the step is still loading or failed to load.
  loadState?: 'loading' | 'error' | 'ready'
  onRetry?: () => void
  onChange: (value: string) => void
  onNext: () => void
  onBack?: () => void
}

const chipClassName = [
  'inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-pill border-2 border-paper bg-surface px-4 font-bold',
  'transition motion-reduce:transition-none hover:bg-peach-deep',
  'peer-checked:bg-yellow peer-checked:shadow-sm',
  // The radio itself is visually hidden, so its focus ring is drawn on the chip.
  'peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-paper peer-focus-visible:ring-4 peer-focus-visible:ring-focus',
].join(' ')

// One condition question: a labelled group of radio buttons styled as choice chips. Native
// radios give single selection and arrow-key movement; nothing is selected by default.
export function ChoiceStep({
  number,
  title,
  hint,
  name,
  options,
  value,
  missingMessage,
  headingRef,
  loadState = 'ready',
  onRetry,
  onChange,
  onNext,
  onBack,
}: ChoiceStepProps) {
  const headingId = useId()
  // The `-error` suffix matches the form fields' error ids.
  const errorId = `${name}-choice-error`
  const [showError, setShowError] = useState(false)
  const [firstInput, setFirstInput] = useState<HTMLInputElement | null>(null)
  const error = showError && value === undefined ? missingMessage : null

  function next() {
    if (value === undefined) {
      setShowError(true)
      firstInput?.focus()
      return
    }
    onNext()
  }

  return (
    <section className="flex flex-col gap-4 rounded-md border-2 border-paper bg-glass p-5 shadow-md">
      <div className="flex items-baseline justify-between gap-3">
        <h2
          id={headingId}
          ref={headingRef}
          tabIndex={-1}
          className="flex items-baseline gap-3 font-display text-card-title leading-tight"
        >
          <span aria-hidden className="text-small font-body font-extrabold">
            {String(number).padStart(2, '0')}
          </span>
          {title}
        </h2>
        <span className="shrink-0 text-small text-muted">{hint}</span>
      </div>

      {loadState === 'loading' ? (
        <p role="status">กำลังโหลดตัวเลือก…</p>
      ) : loadState === 'error' ? (
        <div role="alert" className="flex flex-col items-start gap-3">
          <p className="font-bold text-rust">
            โหลดตัวเลือกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง
          </p>
          <Button variant="secondary" onClick={onRetry}>
            ลองใหม่
          </Button>
        </div>
      ) : (
        <fieldset aria-labelledby={headingId} className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-3">
            {options.map((option, index) => (
              <label key={option.value} className="flex">
                <input
                  ref={index === 0 ? setFirstInput : undefined}
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={value === option.value}
                  aria-describedby={error ? errorId : undefined}
                  aria-invalid={error ? true : undefined}
                  className="peer sr-only"
                  onChange={() => onChange(option.value)}
                />
                <span className={chipClassName}>
                  {option.icon}
                  {option.label}
                </span>
              </label>
            ))}
          </div>
          {error ? (
            <p id={errorId} className="text-small font-bold text-rust">
              {error}
            </p>
          ) : null}
        </fieldset>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        {onBack ? (
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft aria-hidden weight="bold" />
            ย้อนกลับ
          </Button>
        ) : (
          <span aria-hidden />
        )}
        <Button disabled={loadState !== 'ready'} onClick={next}>
          ถัดไป
          <ArrowRight aria-hidden weight="bold" />
        </Button>
      </div>
    </section>
  )
}
