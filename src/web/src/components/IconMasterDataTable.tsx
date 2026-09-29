import { IconKeyLabel } from '@/components/IconKeyLabel'
import { RowActions } from '@/components/RowActions'
import {
  actionsColumnClassName,
  bodyCellClassName,
  headerCellClassName,
  numberColumnClassName,
} from '@/components/tableStyles'
import type { IconRegistry } from '@/lib/iconRegistry'
import type { IconMasterData } from '@/schemas/shared/iconMasterDataSchemas'

type Row = IconMasterData & { id: string }

type IconMasterDataTableProps<Item extends Row> = {
  // Thai entity name used in the caption and action labels, such as `ประเภทอาหาร`.
  entityLabel: string
  registry: IconRegistry
  items: Item[]
  onEdit: (item: Item) => void
  onDelete: (item: Item) => void
}

// Shared list table for FoodType and Taste.
export function IconMasterDataTable<Item extends Row>({
  entityLabel,
  registry,
  items,
  onEdit,
  onDelete,
}: IconMasterDataTableProps<Item>) {
  return (
    <div className="overflow-x-auto rounded-md border-2 border-paper">
      <table className="w-full min-w-[40rem] text-left">
        <caption className="sr-only">รายการ{entityLabel}</caption>
        <thead className="bg-peach-deep text-small">
          <tr>
            <th scope="col" className={headerCellClassName}>
              ชื่อภาษาไทย
            </th>
            <th scope="col" className={headerCellClassName}>
              ชื่อภาษาอังกฤษ
            </th>
            <th scope="col" className={headerCellClassName}>
              ไอคอน
            </th>
            <th
              scope="col"
              className={`${headerCellClassName} ${numberColumnClassName}`}
            >
              ลำดับ
            </th>
            <th
              scope="col"
              className={`${headerCellClassName} ${actionsColumnClassName}`}
            >
              การจัดการ
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <th scope="row" className={`${bodyCellClassName} font-bold`}>
                {item.name.th}
              </th>
              <td className={bodyCellClassName}>{item.name.en}</td>
              <td className={bodyCellClassName}>
                <IconKeyLabel registry={registry} icon={item.icon} />
              </td>
              <td className={`${bodyCellClassName} ${numberColumnClassName}`}>
                {item.sortOrder}
              </td>
              <td className={`${bodyCellClassName} ${actionsColumnClassName}`}>
                <RowActions
                  entityLabel={entityLabel}
                  name={item.name.th}
                  onEdit={() => onEdit(item)}
                  onDelete={() => onDelete(item)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
