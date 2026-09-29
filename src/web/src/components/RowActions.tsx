import { PencilSimple, Trash } from '@phosphor-icons/react'

import { Button } from '@/components/Button'

type RowActionsProps = {
  // Thai entity name and row name for the accessible labels, such as `โซน` and `หน้ามอ`.
  entityLabel: string
  name: string
  onEdit: () => void
  onDelete: () => void
}

export function RowActions({
  entityLabel,
  name,
  onEdit,
  onDelete,
}: RowActionsProps) {
  return (
    <div className="flex justify-center gap-2">
      <Button
        variant="secondary"
        aria-label={`แก้ไข${entityLabel} ${name}`}
        onClick={onEdit}
      >
        <PencilSimple aria-hidden weight="bold" />
        แก้ไข
      </Button>
      <Button
        variant="secondary"
        aria-label={`ลบ${entityLabel} ${name}`}
        onClick={onDelete}
      >
        <Trash aria-hidden weight="bold" />
        ลบ
      </Button>
    </div>
  )
}
