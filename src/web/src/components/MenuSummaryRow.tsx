import { Prohibit, Storefront } from '@phosphor-icons/react'
import { useId, type ReactNode } from 'react'

import { ImagePreview } from '@/components/ImagePreview'
import { formatPrice } from '@/lib/formatPrice'
import type { Localization } from '@/schemas/shared/masterDataFields'

// The MenuItem summary account lists receive (favorites, selected history).
type MenuItemSummary = {
  name: Localization
  price: number
  imageUrl: string | null
  restaurant: { name: Localization }
}

type MenuSummaryRowProps = {
  menuItem: MenuItemSummary
  // False once the MenuItem or its Restaurant is deleted; the row stays, marked in text.
  available: boolean
  // An extra line under the price, such as when the menu was selected.
  detail?: ReactNode
  // Row actions, given the menu name's element ID so each can be described by it.
  action?: (nameId: string) => ReactNode
}

const placeholderClassName =
  'flex h-20 w-20 shrink-0 items-center justify-center rounded-sm border-2 border-dashed border-line-soft text-center text-small text-muted'

// One menu in an account list: photo, names, Restaurant, price, and an unavailable badge.
export function MenuSummaryRow({
  menuItem,
  available,
  detail,
  action,
}: MenuSummaryRowProps) {
  const nameId = useId()

  return (
    <li
      aria-labelledby={nameId}
      className="flex flex-col gap-3 rounded-sm border-2 border-paper bg-surface-raised p-3 shadow-sm sm:flex-row sm:items-center"
    >
      <div className="flex flex-1 items-center gap-3">
        {menuItem.imageUrl ? (
          <ImagePreview
            url={menuItem.imageUrl}
            alt=""
            size="cell"
            fallback={
              <span className={placeholderClassName}>โหลดรูปไม่ได้</span>
            }
          />
        ) : (
          <span className={placeholderClassName}>ไม่มีรูป</span>
        )}
        <div className="flex min-w-0 flex-col gap-1">
          <p id={nameId} className="font-bold">
            {menuItem.name.th}
          </p>
          <p lang="en" className="text-small text-muted">
            {menuItem.name.en}
          </p>
          <p className="flex items-center gap-2 text-small">
            <Storefront aria-hidden size={18} weight="bold" />
            {menuItem.restaurant.name.th}
          </p>
          <p className="font-extrabold">{formatPrice(menuItem.price)}</p>
          {detail}
          {available ? null : (
            <p className="inline-flex items-center gap-1 self-start rounded-pill border-2 border-line-soft bg-canvas-soft px-2 text-small font-bold">
              <Prohibit aria-hidden size={16} weight="bold" />
              เมนูนี้ไม่พร้อมใช้งานแล้ว
            </p>
          )}
        </div>
      </div>
      {action?.(nameId)}
    </li>
  )
}
