import { PencilSimple, Trash } from '@phosphor-icons/react'

import { Button } from '@/components/Button'
import { IconKeyLabel } from '@/components/IconKeyLabel'
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

const cellClassName = 'border-t-2 border-line-soft px-4 py-3 align-top'

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
            <th scope="col" className="px-4 py-3">
              ชื่อภาษาไทย
            </th>
            <th scope="col" className="px-4 py-3">
              ชื่อภาษาอังกฤษ
            </th>
            <th scope="col" className="px-4 py-3">
              ไอคอน
            </th>
            <th scope="col" className="px-4 py-3">
              ลำดับ
            </th>
            <th scope="col" className="px-4 py-3">
              การจัดการ
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <th scope="row" className={`${cellClassName} font-bold`}>
                {item.name.th}
              </th>
              <td className={cellClassName}>{item.name.en}</td>
              <td className={cellClassName}>
                <IconKeyLabel registry={registry} icon={item.icon} />
              </td>
              <td className={cellClassName}>{item.sortOrder}</td>
              <td className={cellClassName}>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    aria-label={`แก้ไข${entityLabel} ${item.name.th}`}
                    onClick={() => onEdit(item)}
                  >
                    <PencilSimple aria-hidden weight="bold" />
                    แก้ไข
                  </Button>
                  <Button
                    variant="secondary"
                    aria-label={`ลบ${entityLabel} ${item.name.th}`}
                    onClick={() => onDelete(item)}
                  >
                    <Trash aria-hidden weight="bold" />
                    ลบ
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
