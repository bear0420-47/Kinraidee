import { IconMasterDataTable } from '@/components/IconMasterDataTable'
import { tasteIcons } from '@/lib/tasteIcons'
import type { Taste } from '@/schemas/admin/tastes/tasteSchemas'

type TasteTableProps = {
  tastes: Taste[]
  onEdit: (taste: Taste) => void
  onDelete: (taste: Taste) => void
}

export function TasteTable({ tastes, ...props }: TasteTableProps) {
  return (
    <IconMasterDataTable
      entityLabel="รสชาติ"
      registry={tasteIcons}
      items={tastes}
      {...props}
    />
  )
}
