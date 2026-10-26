import { ArrowRight, CaretDown, CheckCircle } from '@phosphor-icons/react'
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
  previewCount?: number
  moreOptionsLabel?: string
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
  'relative inline-flex h-full w-full cursor-pointer items-center justify-center gap-2 text-center font-bold',
  'transition motion-reduce:transition-none hover:bg-peach',
  'peer-checked:bg-yellow peer-checked:hover:bg-yellow',
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
  previewCount,
  moreOptionsLabel = 'ดูตัวเลือกอื่น',
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
  const visibleCount = previewCount ?? options.length
  const additionalOptions = options.slice(visibleCount)
  const gridClassName = `grid gap-3 ${name === 'budget' ? 'grid-cols-1 min-[360px]:grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`

  function renderOption(option: ChoiceOption, index: number) {
    const additional = index >= visibleCount
    return (
      <label key={option.value} className="flex min-w-0 max-w-full">
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
            // Keyboard selection stays in the group; pointer activation also advances.
            if (event.detail > 0) onChange(option.value, true)
          }}
        />
        <span
          className={`${chipClassName} ${additional ? 'min-h-11 rounded-pill border border-dashed border-line-soft bg-surface px-3 py-2 text-small hover:border-paper' : `rounded-tl-xs rounded-tr-md rounded-bl-md rounded-br-xs border-2 border-paper bg-cream px-3 py-3 shadow-sm hover:shadow-md motion-safe:hover:-translate-y-0.5 peer-checked:shadow-md ${previewCount ? 'min-h-16' : 'min-h-20'} ${name === 'budget' ? 'font-display text-card-title' : 'text-body'}`} ${option.icon && !previewCount ? 'flex-col' : ''}`}
        >
          {option.icon ? (
            <span
              aria-hidden
              className={`shrink-0 ${additional ? '[&_svg]:size-4' : '[&_svg]:size-6'}`}
            >
              {option.icon}
            </span>
          ) : null}
          <span className="min-w-0 break-words">{option.label}</span>
          {value === option.value ? (
            <CheckCircle
              aria-hidden
              weight="fill"
              size={16}
              className={
                additional
                  ? 'shrink-0 text-paper'
                  : 'absolute top-2 right-2 text-paper'
              }
            />
          ) : null}
        </span>
      </label>
    )
  }

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
            <div className={gridClassName}>
              {options.slice(0, visibleCount).map(renderOption)}
            </div>
            {additionalOptions.length > 0 ? (
              <details
                className="group"
                open={
                  additionalOptions.some((option) => option.value === value) ||
                  undefined
                }
              >
                <summary
                  aria-label={`${moreOptionsLabel}อีก ${additionalOptions.length} ตัวเลือก`}
                  className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-xs px-1 py-2 text-paper [&::-webkit-details-marker]:hidden"
                >
                  <span className="font-display text-body underline decoration-line-soft decoration-dashed underline-offset-4 group-hover:decoration-paper">
                    {moreOptionsLabel}
                  </span>
                  <span
                    aria-hidden
                    className="-rotate-3 rounded-pill bg-peach px-2 py-0.5 text-small font-bold"
                  >
                    +{additionalOptions.length}
                  </span>
                  <CaretDown
                    aria-hidden
                    weight="bold"
                    size={16}
                    className="shrink-0 motion-safe:transition-transform group-open:rotate-180"
                  />
                </summary>
                <div className="mt-2 flex flex-wrap gap-2">
                  {additionalOptions.map((option, index) =>
                    renderOption(option, visibleCount + index),
                  )}
                </div>
              </details>
            ) : null}
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
