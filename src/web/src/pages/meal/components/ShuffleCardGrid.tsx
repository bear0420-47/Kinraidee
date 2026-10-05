import { ArrowCounterClockwise, Eye, PencilSimple } from '@phosphor-icons/react'
import { useEffect, useState, type Ref } from 'react'

import { Button } from '@/components/Button'
import { FormAlert } from '@/components/FormAlert'
import { useRequestRecommendations } from '@/hooks/meal/useRecommendations'
import {
  replacementRequest,
  type RecommendationConditions,
  type RecommendationItem,
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

type ShuffleCardGridProps = {
  conditions: RecommendationConditions
  shortlist: Shortlist
  headingRef: Ref<HTMLHeadingElement>
  onUpdate: (update: (shortlist: Shortlist) => Shortlist) => void
  onEditConditions: () => void
  // The confirmation step's entry point (#55).
  onChoose?: ((item: RecommendationItem) => void) | undefined
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
  shortlist,
  headingRef,
  onUpdate,
  onEditConditions,
  onChoose,
}: ShuffleCardGridProps) {
  const request = useRequestRecommendations()
  const [replacingSlot, setReplacingSlot] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  // Focus follows the card an action changed, once it has re-rendered.
  const [focusSlot, setFocusSlot] = useState<number | null>(null)
  const busy = replacingSlot !== null
  const { undo } = shortlist
  const undoMessage = undo ? `ไม่เอา ${undo.previous.item.name.th} แล้ว` : ''

  useEffect(() => {
    if (focusSlot === null) return
    document.getElementById(focusTargetId(focusSlot))?.focus()
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
      setError('หาเมนูใหม่ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
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

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="font-display text-card-title leading-tight"
          >
            เมนูที่น่าจะตรงใจ
          </h2>
          <p className="text-small text-muted">
            เปิดการ์ดทีละใบ หรือเปิดทั้งหมดพร้อมกัน
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
            แก้เงื่อนไข
          </Button>
        </div>
      </div>

      {error ? <FormAlert message={error} /> : null}

      {/* Only the returned cards are shown; there are no empty placeholders. */}
      <ul
        aria-label="การ์ดเมนู"
        className={`grid grid-cols-1 gap-4 ${gridColumns[shortlist.slots.length - 1] ?? ''}`}
      >
        {shortlist.slots.map((slot, index) => (
          <li key={index} className="[perspective:800px]">
            <MenuCard
              position={index + 1}
              slot={slot}
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
            เลิกทำ
          </Button>
        </div>
      ) : null}
    </section>
  )
}
