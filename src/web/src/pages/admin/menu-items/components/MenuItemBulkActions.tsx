import { ArrowCounterClockwise, Trash } from '@phosphor-icons/react'

import { Button } from '@/components/Button'
import { MAX_BULK_SELECTION } from '@/schemas/admin/menu-items/menuItemSchemas'

type MenuItemBulkActionsProps = {
  selectedCount: number
  // Some selected item sits under a deleted Restaurant, so bulk restore is not allowed.
  restoreBlocked: boolean
  onDelete: () => void
  onRestore: () => void
}

const restoreBlockedId = 'menu-item-bulk-restore-blocked'

export const BULK_RESTORE_BLOCKED_MESSAGE =
  'มีเมนูที่อยู่ใต้ร้านอาหารที่ถูกลบ กรุณากู้คืนร้านอาหารก่อน'

export function MenuItemBulkActions({
  selectedCount,
  restoreBlocked,
  onDelete,
  onRestore,
}: MenuItemBulkActionsProps) {
  const nothingSelected = selectedCount === 0

  return (
    <section
      aria-label="จัดการเมนูที่เลือก"
      className="flex flex-col gap-3 rounded-lg border-2 border-line-soft p-4 md:flex-row md:items-center md:justify-between"
    >
      <div className="flex flex-col gap-1">
        <p role="status" className="font-bold">
          เลือกเมนูแล้ว {selectedCount} รายการ
        </p>
        <p className="text-small text-muted">
          เลือกได้สูงสุด {MAX_BULK_SELECTION} รายการต่อครั้ง
        </p>
        {restoreBlocked ? (
          <p id={restoreBlockedId} className="text-small font-bold text-rust">
            {BULK_RESTORE_BLOCKED_MESSAGE}
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant="secondary"
          disabled={nothingSelected}
          aria-label={`ลบเมนูที่เลือก ${selectedCount} รายการ`}
          onClick={onDelete}
        >
          <Trash aria-hidden weight="bold" />
          ลบเมนูที่เลือก
        </Button>
        <Button
          variant="secondary"
          disabled={nothingSelected || restoreBlocked}
          aria-label={`กู้คืนเมนูที่เลือก ${selectedCount} รายการ`}
          aria-describedby={restoreBlocked ? restoreBlockedId : undefined}
          onClick={onRestore}
        >
          <ArrowCounterClockwise aria-hidden weight="bold" />
          กู้คืนเมนูที่เลือก
        </Button>
      </div>
    </section>
  )
}
