import { ArrowRight, CheckCircle } from '@phosphor-icons/react'
import { useId, useState, type ReactNode, type Ref } from 'react'

import { Button } from '@/components/Button'
import { conditionSteps } from '@/schemas/meal/recommendationSchemas'
import { StepFooter } from './StepFooter'

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
  onChange: (value: string, advance?: boolean) => void
  onNext: () => void
  onBack?: (() => void) | undefined
  editing?: boolean
}

const chipClassName = [
  'relative inline-flex h-full w-full min-h-20 cursor-pointer items-center justify-center gap-2 rounded-tl-xs rounded-tr-md rounded-bl-md rounded-br-xs border-2 border-paper bg-cream px-3 py-3 text-center font-bold shadow-sm',
  'transition motion-reduce:transition-none hover:bg-peach hover:shadow-md motion-safe:hover:-translate-y-0.5',
  'peer-checked:bg-yellow peer-checked:shadow-md peer-checked:hover:bg-yellow',
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
  editing = false,
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
    <section className="flex flex-col gap-5 rounded-lg border-2 border-paper bg-surface p-4 shadow-lg sm:p-6">
      <div className="flex flex-col gap-3">
        <h2
          id={headingId}
          ref={headingRef}
          tabIndex={-1}
          className="min-w-0 pt-1 font-display text-section-mobile leading-snug sm:text-section"
        >
          {title}
        </h2>
        <div className="flex flex-wrap items-center justify-between gap-3 text-small">
          <span className="text-muted">{hint}</span>
          <span
            role="status"
            className="rounded-pill bg-peach px-3 py-1 font-bold text-paper"
          >
            ข้อ {number} จาก {conditionSteps.length}
          </span>
        </div>
      </div>

      {/* A shared minimum height keeps the footer in place as option counts change. */}
      <div className="min-h-44">
        {loadState === 'loading' ? (
          <p role="status">กำลังโหลดตัวเลือกให้นะ…</p>
        ) : loadState === 'error' ? (
          <div role="alert" className="flex flex-col items-start gap-3">
            <p className="font-bold text-rust">
              โหลดตัวเลือกไม่สำเร็จ ลองอีกครั้งนะ
            </p>
            <Button variant="secondary" onClick={onRetry}>
              ลองใหม่
            </Button>
          </div>
        ) : (
          <fieldset
            aria-labelledby={headingId}
            aria-describedby={`${name}-advance-hint`}
            className="flex flex-col gap-3"
          >
            <p aria-hidden className="text-small text-muted">
              {editing ? 'แตะคำตอบเพื่อกลับไปดูสรุป' : 'แตะคำตอบเพื่อไปต่อ'}
            </p>
            <p id={`${name}-advance-hint`} className="sr-only">
              {editing
                ? 'แตะคำตอบแล้วกลับไปดูสรุปได้เลย หรือกดใช้คำตอบนี้'
                : 'แตะคำตอบแล้วไปต่อได้เลย ถ้าใช้คีย์บอร์ดให้กดถัดไป'}
            </p>
            <div
              className={`grid gap-3 ${name === 'budget' ? 'grid-cols-1 min-[360px]:grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}
            >
              {options.map((option, index) => (
                <label key={option.value} className="flex min-w-0">
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
                    onClick={(event) => {
                      // Keep native keyboard selection in the group; pointer activation
                      // also advances, including an already-checked option.
                      if (event.detail > 0) onChange(option.value, true)
                    }}
                  />
                  <span
                    className={`${chipClassName} ${option.icon ? 'flex-col' : ''} ${name === 'budget' ? 'font-display text-card-title' : 'text-body'}`}
                  >
                    {option.icon ? (
                      <span aria-hidden className="[&_svg]:size-6">
                        {option.icon}
                      </span>
                    ) : null}
                    {option.label}
                    {value === option.value ? (
                      <CheckCircle
                        aria-hidden
                        weight="fill"
                        size={16}
                        className="absolute top-2 right-2 text-paper"
                      />
                    ) : null}
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
      </div>

      <StepFooter onBack={onBack}>
        <Button disabled={loadState !== 'ready'} onClick={next}>
          {editing ? 'ใช้คำตอบนี้' : 'ถัดไป'}
          <ArrowRight aria-hidden weight="bold" />
        </Button>
      </StepFooter>
    </section>
  )
}
