import {
  Check,
  Info,
  MapPin,
  Storefront,
  ThumbsDown,
  X,
} from '@phosphor-icons/react'

import { useState } from 'react'

import { Dialog } from '@/components/Dialog'
import { usePlaceDetails } from '@/hooks/meal/usePlaceDetails'
import { Button } from '@/components/Button'
import { FavoriteButton } from '@/components/FavoriteButton'
import { FoodTypeIcon } from '@/lib/foodTypeIcons'
import { formatPrice } from '@/lib/formatPrice'
import { TasteIcon } from '@/lib/tasteIcons'
import { toFavoriteMenuItem } from '@/schemas/favorites/favoriteSchemas'
import {
  conditionDifferences,
  type RecommendationConditions,
  type RecommendationItem,
  type Slot,
} from '@/schemas/meal/recommendationSchemas'
import { MenuPhoto } from './MenuPhoto'
import { AiSelectionReason } from './AiSelectionReason'
import { PlaceDetailsPanel } from './PlaceDetailsPanel'
import { RationaleList } from './RationaleList'

type MenuCardProps = {
  // 1-based position, used in labels such as `การ์ดใบที่ 2`.
  position: number
  slot: Slot
  // Original filters, supplied only for automatically shown closest alternatives.
  comparisonConditions?: RecommendationConditions | undefined
  // A replacement for this card is being requested.
  replacing: boolean
  // Another request is in flight, so card actions wait.
  busy: boolean
  // Receives focus after an action changes this card.
  focusTargetId: string
  onReject: () => void
  // Opens the confirmation dialog for this card's menu.
  onChoose: (item: RecommendationItem) => void
}

// Lets a reopened confirmation dialog return focus to the card it came from.
export function chooseButtonId(menuItemId: string) {
  return `meal-choose-${menuItemId}`
}

const cardClassName =
  'flex h-full min-h-72 flex-col gap-3 rounded-xl border-2 border-paper p-4 shadow-md'

// One shortlist card. Every state is named in text, so it never relies on colour or motion.
export function MenuCard(props: MenuCardProps) {
  const { slot, replacing, focusTargetId } = props

  if (replacing) {
    return (
      <div
        className={`${cardClassName} items-center justify-center bg-canvas-soft`}
      >
        <p role="status" className="font-bold">
          กำลังหาเมนูใหม่ให้นะ…
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
          รอบนี้ไม่มีเมนูเพิ่มแล้ว
        </p>
        <p className="text-small text-muted">
          รอบนี้ยังไม่มีเมนูอื่นมาแทน ลองเปลี่ยนตัวเลือกหรือเริ่มใหม่ได้นะ
        </p>
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
  comparisonConditions,
}: MenuCardProps & { item: RecommendationItem }) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  usePlaceDetails(item.restaurant.id)
  const differences = comparisonConditions
    ? conditionDifferences(item, comparisonConditions)
    : []
  return (
    <article
      aria-labelledby={focusTargetId}
      className={`${cardClassName} bg-surface motion-safe:animate-card-reveal`}
    >
      {/* A short strip across the card top, so a revealed card fits on screen. */}
      <div className="relative -mx-4 -mt-4">
        <MenuPhoto
          item={item}
          className="h-32 rounded-t-lg border-b-2 sm:h-40"
        />
        <FavoriteButton
          menuItem={toFavoriteMenuItem(item)}
          className="absolute right-3 top-3"
        />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-small text-muted">เมนูที่ {position}</p>
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
      </div>

      <ul className="flex flex-col gap-1 text-small">
        <li className="flex items-center gap-2">
          <Storefront aria-hidden size={18} weight="bold" />
          {item.restaurant.name.th}
        </li>
        <li className="flex flex-wrap gap-x-3 gap-y-1">
          <span className="flex items-center gap-2">
            <MapPin aria-hidden size={18} weight="bold" className="shrink-0" />
            {item.zone.name.th}
          </span>
          <span className="flex items-center gap-2">
            <FoodTypeIcon
              aria-hidden
              icon={item.foodType.icon}
              size={18}
              weight="bold"
              className="shrink-0"
            />
            {item.foodType.name.th}
          </span>
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

      <RationaleList
        compact
        rationale={item.rationale}
        differences={differences}
      />
      {!comparisonConditions ? (
        <AiSelectionReason selection={item.selection} />
      ) : null}
      <div className="mt-auto flex flex-col gap-2 pt-2">
        <Button
          id={chooseButtonId(item.id)}
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
          aria-label={`ขอดูเมนูอื่นแทน ${item.name.th}`}
          onClick={onReject}
        >
          <ThumbsDown aria-hidden weight="bold" />
          ขอดูเมนูอื่น
        </Button>
      </div>
      <Button
        variant="ghost"
        aria-haspopup="dialog"
        onClick={() => setDetailsOpen(true)}
        className="w-full text-small"
      >
        <Info aria-hidden weight="bold" />
        ดูรายละเอียดเมนูและร้าน
      </Button>
      {detailsOpen ? (
        <Dialog title={item.name.th} onClose={() => setDetailsOpen(false)}>
          <p lang="en" className="text-small text-muted">
            {item.name.en}
          </p>
          <PlaceDetailsPanel restaurantId={item.restaurant.id} />
          <Button variant="secondary" onClick={() => setDetailsOpen(false)}>
            <X aria-hidden weight="bold" />
            ปิด
          </Button>
        </Dialog>
      ) : null}
    </article>
  )
}
