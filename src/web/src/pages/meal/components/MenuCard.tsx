import {
  Check,
  MapPin,
  Question,
  Storefront,
  ThumbsDown,
} from '@phosphor-icons/react'

import { Button } from '@/components/Button'
import { FoodTypeIcon } from '@/lib/foodTypeIcons'
import { formatPrice } from '@/lib/formatPrice'
import { TasteIcon } from '@/lib/tasteIcons'
import type {
  RecommendationItem,
  Slot,
} from '@/schemas/meal/recommendationSchemas'
import { MenuPhoto } from './MenuPhoto'
import { RationaleList } from './RationaleList'

type MenuCardProps = {
  // 1-based position, used in labels such as `การ์ดใบที่ 2`.
  position: number
  slot: Slot
  // A replacement for this card is being requested.
  replacing: boolean
  // Another request is in flight, so card actions wait.
  busy: boolean
  // Receives focus after an action changes this card.
  focusTargetId: string
  onReveal: () => void
  onReject: () => void
  // Opens the confirmation dialog for this card's menu.
  onChoose: (item: RecommendationItem) => void
}

const cardClassName =
  'flex h-full flex-col gap-3 rounded-md border-2 border-paper p-4 shadow-md'

// One shortlist card. Every state is named in text, so it never relies on colour or motion.
export function MenuCard(props: MenuCardProps) {
  const { slot, replacing, position, focusTargetId } = props

  if (replacing) {
    return (
      <div
        className={`${cardClassName} items-center justify-center bg-canvas-soft`}
      >
        <p role="status" className="font-bold">
          กำลังหาเมนูใหม่…
        </p>
      </div>
    )
  }

  if (slot.kind === 'exhausted') {
    return (
      <div
        className={`${cardClassName} justify-center bg-canvas-soft text-center`}
      >
        <p id={focusTargetId} tabIndex={-1} className="font-bold">
          ไม่มีตัวเลือกเพิ่มแล้ว
        </p>
        <p className="text-small text-muted">
          ไม่มีเมนูอื่นที่ตรงกับเงื่อนไขสำหรับการ์ดใบที่ {position}
        </p>
      </div>
    )
  }

  if (!slot.revealed) {
    return (
      <div
        className={`${cardClassName} items-center justify-center bg-peach-deep text-center`}
      >
        <Question aria-hidden size={48} weight="bold" />
        <p className="font-display text-card-title">การ์ดใบที่ {position}</p>
        <p className="text-small">ยังไม่เปิด</p>
        <Button
          id={focusTargetId}
          variant="secondary"
          disabled={props.busy}
          aria-label={`เปิดการ์ดใบที่ ${position}`}
          onClick={props.onReveal}
        >
          เปิดการ์ด
        </Button>
      </div>
    )
  }

  return <RevealedCard {...props} item={slot.item} />
}

function RevealedCard({
  item,
  position,
  busy,
  focusTargetId,
  onReject,
  onChoose,
}: MenuCardProps & { item: RecommendationItem }) {
  return (
    <article
      aria-labelledby={focusTargetId}
      className={`${cardClassName} bg-surface motion-safe:animate-card-reveal`}
    >
      {/* A short strip across the card top, so a revealed card fits on screen. */}
      <MenuPhoto
        item={item}
        className="-mx-4 -mt-4 h-40 rounded-t-[10px] border-b-2"
      />
      <div className="flex flex-col gap-1">
        <p className="text-small text-muted">
          การ์ดใบที่ {position} · เปิดแล้ว
        </p>
        <div className="flex items-start justify-between gap-3">
          <h3
            id={focusTargetId}
            tabIndex={-1}
            className="font-display text-card-title leading-tight"
          >
            {item.name.th}
          </h3>
          <p className="shrink-0 text-card-title font-extrabold">
            {formatPrice(item.price)}
          </p>
        </div>
        <p lang="en" className="text-small text-muted">
          {item.name.en}
        </p>
      </div>

      <ul className="flex flex-col gap-1 text-small">
        <li className="flex items-center gap-2">
          <Storefront aria-hidden size={18} weight="bold" />
          {item.restaurant.name.th}
        </li>
        <li className="flex items-center gap-2">
          <MapPin aria-hidden size={18} weight="bold" />
          {item.zone.name.th}
        </li>
        <li className="flex items-center gap-2">
          <FoodTypeIcon
            aria-hidden
            icon={item.foodType.icon}
            size={18}
            weight="bold"
          />
          {item.foodType.name.th}
        </li>
      </ul>

      {item.tastes.length > 0 ? (
        <ul aria-label="รสชาติ" className="flex flex-wrap gap-2">
          {item.tastes.map((taste) => (
            <li
              key={taste.id}
              className="inline-flex items-center gap-1 rounded-pill border-2 border-line-soft px-2 text-small"
            >
              <TasteIcon
                aria-hidden
                icon={taste.icon}
                size={16}
                weight="bold"
              />
              {taste.name.th}
            </li>
          ))}
        </ul>
      ) : null}

      <RationaleList rationale={item.rationale} />

      <div className="mt-auto flex flex-col gap-2 pt-2">
        <Button
          disabled={busy}
          aria-label={`เลือกเมนู ${item.name.th}`}
          onClick={() => onChoose(item)}
        >
          <Check aria-hidden weight="bold" />
          เลือกเมนูนี้
        </Button>
        <Button
          variant="secondary"
          disabled={busy}
          aria-label={`ไม่เอาเมนู ${item.name.th}`}
          onClick={onReject}
        >
          <ThumbsDown aria-hidden weight="bold" />
          ไม่เอาเมนูนี้
        </Button>
      </div>
    </article>
  )
}
