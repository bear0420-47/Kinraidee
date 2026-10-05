import { PencilSimple, Trash } from '@phosphor-icons/react'

import { Button } from '@/components/Button'

type RowActionsProps = {
  // Thai entity name and row name for the accessible labels, such as `โซน` and `หน้ามอ`.
  entityLabel: string
  name: string
  onEdit: () => void
  onDelete: () => void
  // Id of visible text explaining why the row cannot be edited; disables the edit button.
  editBlockedReasonId?: string | undefined
  size?: 'default' | 'compact'
}

export function RowActions({
  entityLabel,
  name,
  onEdit,
  onDelete,
  editBlockedReasonId,
  size = 'default',
}: RowActionsProps) {
  return (
    <div className="flex justify-center gap-2">
      <Button
        variant="secondary"
        size={size}
        aria-label={`แก้ไข${entityLabel} ${name}`}
        disabled={Boolean(editBlockedReasonId)}
        aria-describedby={editBlockedReasonId}
        onClick={onEdit}
      >
        <PencilSimple aria-hidden weight="bold" />
        แก้ไข
      </Button>
      <Button
        variant="secondary"
        size={size}
        aria-label={`ลบ${entityLabel} ${name}`}
        onClick={onDelete}
      >
        <Trash aria-hidden weight="bold" />
        ลบ
      </Button>
    </div>
  )
}
