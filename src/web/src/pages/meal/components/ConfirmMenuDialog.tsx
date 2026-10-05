import {
  ArrowCounterClockwise,
  Check,
  MapPin,
  Storefront,
} from '@phosphor-icons/react'
import { useState } from 'react'

import { Button } from '@/components/Button'
import { Dialog } from '@/components/Dialog'
import { formatPrice } from '@/lib/formatPrice'
import type { RecommendationItem } from '@/schemas/meal/recommendationSchemas'
import { MenuPhoto } from './MenuPhoto'
import { RationaleList } from './RationaleList'
import { RecommendationSuccess, successMessage } from './RecommendationSuccess'

type ConfirmMenuDialogProps = {
  // The chosen card's menu, exactly as the recommendation response returned it.
  item: RecommendationItem
  // `ขอคิดอีกที`: close and go back to the unchanged cards.
  onCancel: () => void
  // `กลับหน้าหลัก`: clear the flow and go Home.
  onFinish: () => void
}

// Two stages in one dialog: confirm the chosen menu, then the success state. Everything shown
// comes from the recommendation response, so opening it makes no request.
export function ConfirmMenuDialog({
  item,
  onCancel,
  onFinish,
}: ConfirmMenuDialogProps) {
  const [confirmed, setConfirmed] = useState(false)

  return (
    <Dialog
      title={confirmed ? 'ได้มื้อนี้แล้ว!' : 'เลือกเมนูนี้ใช่ไหม?'}
      // Escape follows the stage's own way out: back to the cards, or Home once confirmed.
      onClose={confirmed ? onFinish : onCancel}
    >
      {/* Always present so the success state is announced as soon as it appears. */}
      <p role="status" className="sr-only">
        {confirmed ? successMessage(item) : ''}
      </p>
      {confirmed ? (
        <RecommendationSuccess item={item} onFinish={onFinish} />
      ) : (
        <>
          <MenuPhoto item={item} className="rounded-md border-2" />
          <div className="flex flex-col gap-1">
            <p className="font-display text-card-title leading-tight">
              {item.name.th}
            </p>
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
          </ul>
          <p className="text-card-title font-extrabold">
            {formatPrice(item.price)}
          </p>
          <RationaleList rationale={item.rationale} />
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={onCancel}>
              <ArrowCounterClockwise aria-hidden weight="bold" />
              ขอคิดอีกที
            </Button>
            <Button onClick={() => setConfirmed(true)}>
              <Check aria-hidden weight="bold" />
              เอาเมนูนี้แหละ
            </Button>
          </div>
        </>
      )}
    </Dialog>
  )
}
