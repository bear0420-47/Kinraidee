import {
  ArrowCounterClockwise,
  ArrowsClockwise,
  Eye,
  PencilSimple,
} from '@phosphor-icons/react'
import { useEffect, useState, type Ref } from 'react'

import { Button } from '@/components/Button'
import { FormAlert } from '@/components/FormAlert'
import { useRequestRecommendations } from '@/hooks/meal/useRecommendations'
import { prefersReducedMotion } from '@/lib/motion'
import {
  replacementRequest,
  type RecommendationConditions,
  type RecommendationItem,
  type ConditionStep,
  type Shortlist,
} from '@/schemas/meal/recommendationSchemas'
import {
  hasFaceDownCard,
  replaceCard,
  revealAll,
  revealCard,
  undoReject,
} from '@/schemas/meal/shortlist'
import { MenuCard } from './MenuCard'
import { ConditionSummary } from './ConditionSummary'

type ShuffleCardGridProps = {
  conditions: RecommendationConditions
  conditionOptions: {
    tastes: { id: string; name: { th: string } }[]
    foodTypes: { id: string; name: { th: string } }[]
    zones: { id: string; name: { th: string } }[]
  }
  onEditCondition: (step: ConditionStep) => void
  shortlist: Shortlist
  headingRef: Ref<HTMLHeadingElement>
  onUpdate: (update: (shortlist: Shortlist) => Shortlist) => void
  onEditConditions: () => void
  // Clears the whole flow and returns to question 1.
  onStartOver: () => void
  // Opens confirmation for a revealed card's menu.
  onChoose: (item: RecommendationItem) => void
}

const focusTargetId = (slotIndex: number) => `meal-card-${slotIndex}-focus`

// Indexed by card count, so one or two results are not stretched across empty columns.
const gridColumns = [
  'max-w-sm',
  'sm:grid-cols-2',
  'sm:grid-cols-2 lg:grid-cols-3',
]

// Up to three cards from one recommendation response. Revealing is presentation only; only
// rejecting a card asks the API again, for one replacement in the same slot.
export function ShuffleCardGrid({
  conditions,
  conditionOptions,
  onEditCondition,
  shortlist,
  headingRef,
  onUpdate,
  onEditConditions,
  onStartOver,
  onChoose,
}: ShuffleCardGridProps) {
  const request = useRequestRecommendations()
  const [activeCard, setActiveCard] = useState(0)
  const [replacingSlot, setReplacingSlot] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  // Focus follows the card an action changed, once it has re-rendered.
  const [focusSlot, setFocusSlot] = useState<number | null>(null)
  const busy = replacingSlot !== null
  const { undo } = shortlist
  const undoMessage = undo ? `ข้าม ${undo.previous.item.name.th} แล้ว` : ''

  useEffect(() => {
    if (focusSlot === null) return
    const target = document.getElementById(focusTargetId(focusSlot))
    // Bring the whole card into view, not just its heading, so its actions are visible
    // without scrolling. A card taller than the screen is aligned to its top.
    target?.focus({ preventScroll: true })
    document.getElementById(`meal-card-slot-${focusSlot}`)?.scrollIntoView({
      block: 'nearest',
      inline: 'start',
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    })
    setFocusSlot(null)
  }, [focusSlot, shortlist])

  function reveal(slotIndex: number) {
    onUpdate((current) => revealCard(current, slotIndex))
    setFocusSlot(slotIndex)
  }

  function showAll() {
    onUpdate(revealAll)
    setFocusSlot(0)
  }

  async function reject(slotIndex: number) {
    setError(null)
    setReplacingSlot(slotIndex)
    try {
      const { items } = await request.mutateAsync(
        replacementRequest(conditions, shortlist, slotIndex),
      )
      onUpdate((current) => replaceCard(current, slotIndex, items[0] ?? null))
      setFocusSlot(slotIndex)
    } catch {
      // Nothing changes: the card stays and is not added to the rejected IDs.
      setError('หาเมนูใหม่ไม่สำเร็จ ลองอีกครั้งนะ')
      setFocusSlot(slotIndex)
    } finally {
      setReplacingSlot(null)
    }
  }

  function restore() {
    if (!undo) return
    onUpdate(undoReject)
    setFocusSlot(undo.slotIndex)
  }

  function browseCard(index: number) {
    setActiveCard(index)
    setFocusSlot(index)
  }

  return (
    <section className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="font-display text-card-title leading-tight"
          >
            {shortlist.closestConditions
              ? 'เมนูใกล้เคียงที่น่าลอง'
              : 'มีเมนูน่าลองมาให้แล้ว'}
          </h1>
          <p className="text-small text-muted">
            {shortlist.closestConditions
              ? 'ดูราคาและข้อที่ต่าง แล้วเลือกเมนูที่โอเคได้เลย'
              : 'ลองเปิดดูทีละใบ หรือเปิดทั้งหมดก็ได้'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {hasFaceDownCard(shortlist) ? (
            <Button variant="secondary" disabled={busy} onClick={showAll}>
              <Eye aria-hidden weight="bold" />
              เปิดทั้งหมด
            </Button>
          ) : null}
          <Button variant="ghost" disabled={busy} onClick={onEditConditions}>
            <PencilSimple aria-hidden weight="bold" />
            เปลี่ยนตัวเลือก
          </Button>
          <Button variant="ghost" disabled={busy} onClick={onStartOver}>
            <ArrowsClockwise aria-hidden weight="bold" />
            เริ่มใหม่
          </Button>
        </div>
      </div>

      <ConditionSummary
        compact
        conditions={conditions}
        {...conditionOptions}
        shuffling={busy}
        onEdit={onEditCondition}
      />

      {shortlist.closestConditions ? (
        <p
          role="status"
          className="rounded-sm border-2 border-dashed border-line-soft bg-cream p-4"
        >
          ยังไม่มีเมนูตรงทุกข้อ ลองดูเมนูใกล้เคียงพวกนี้นะ
        </p>
      ) : null}

      {error ? <FormAlert message={error} /> : null}

      {shortlist.slots.length > 1 ? (
        <nav aria-label="ดูการ์ดเมนู" className="flex flex-col gap-2 sm:hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 text-small">
            <p className="text-muted">ปัดซ้าย–ขวา ดูเมนูอื่นได้เลย</p>
            <p aria-live="polite" aria-atomic="true" className="font-bold">
              ใบที่ {activeCard + 1} จาก {shortlist.slots.length}
            </p>
          </div>
          <div className="flex gap-2">
            {shortlist.slots.map((_, index) => (
              <Button
                key={index}
                variant={index === activeCard ? 'secondary' : 'ghost'}
                size="compact"
                className="min-h-11 min-w-11"
                aria-label={`ดูการ์ดใบที่ ${index + 1}`}
                aria-controls={`meal-card-slot-${index}`}
                aria-current={index === activeCard ? 'true' : undefined}
                onClick={() => browseCard(index)}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </nav>
      ) : null}

      {/* Only the returned cards are shown; there are no empty placeholders. */}
      <ul
        aria-label="การ์ดเมนู"
        className={`-mx-2 flex min-w-0 items-start snap-x snap-mandatory scroll-px-2 gap-4 overflow-x-auto overscroll-x-contain px-2 pt-1 pb-3 motion-safe:scroll-smooth sm:mx-0 sm:grid sm:items-stretch sm:snap-none sm:overflow-visible sm:p-0 ${shortlist.slots.length > 1 ? "after:w-4 after:shrink-0 after:content-[''] sm:after:hidden" : ''} ${gridColumns[shortlist.slots.length - 1] ?? ''}`}
        onScroll={(event) => {
          const rail = event.currentTarget
          const left = rail.getBoundingClientRect().left
          let nearest = 0
          let distance = Infinity
          Array.from(rail.children).forEach((card, index) => {
            const offset = Math.abs(card.getBoundingClientRect().left - left)
            if (offset < distance) {
              nearest = index
              distance = offset
            }
          })
          setActiveCard(nearest)
        }}
      >
        {shortlist.slots.map((slot, index) => (
          <li
            key={index}
            id={`meal-card-slot-${index}`}
            className={`${shortlist.slots.length > 1 ? 'w-[calc(100%_-_2rem)]' : 'w-full'} min-w-0 shrink-0 snap-start [perspective:800px] sm:w-auto`}
          >
            <MenuCard
              position={index + 1}
              slot={slot}
              comparisonConditions={
                shortlist.closestConditions ? conditions : undefined
              }
              replacing={replacingSlot === index}
              busy={busy}
              focusTargetId={focusTargetId(index)}
              onReveal={() => reveal(index)}
              onReject={() => void reject(index)}
              onChoose={onChoose}
            />
          </li>
        ))}
      </ul>

      {/* Always present so the rejection is announced as soon as it happens. */}
      <p role="status" className="sr-only">
        {undoMessage}
      </p>
      {undo ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border-2 border-dashed border-line-soft bg-cream p-3">
          <p aria-hidden>{undoMessage}</p>
          <Button
            variant="soft"
            size="compact"
            disabled={busy}
            onClick={restore}
          >
            <ArrowCounterClockwise aria-hidden weight="bold" />
            เอาเมนูเดิมกลับมา
          </Button>
        </div>
      ) : null}
    </section>
  )
}
