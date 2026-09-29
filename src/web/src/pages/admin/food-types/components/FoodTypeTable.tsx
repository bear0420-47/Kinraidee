import { PencilSimple, Trash } from '@phosphor-icons/react'

import { Button } from '@/components/Button'
import { IconKeyLabel } from '@/components/IconKeyLabel'
import { foodTypeIcons } from '@/lib/foodTypeIcons'
import type { FoodType } from '@/schemas/admin/food-types/foodTypeSchemas'

type FoodTypeTableProps = {
  foodTypes: FoodType[]
  onEdit: (foodType: FoodType) => void
  onDelete: (foodType: FoodType) => void
}

const cellClassName = 'border-t-2 border-line-soft px-4 py-3 align-top'

export function FoodTypeTable({
  foodTypes,
  onEdit,
  onDelete,
}: FoodTypeTableProps) {
  return (
    <div className="overflow-x-auto rounded-md border-2 border-paper">
      <table className="w-full min-w-[40rem] text-left">
        <caption className="sr-only">รายการประเภทอาหาร</caption>
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
          {foodTypes.map((foodType) => (
            <tr key={foodType.id}>
              <th scope="row" className={`${cellClassName} font-bold`}>
                {foodType.name.th}
              </th>
              <td className={cellClassName}>{foodType.name.en}</td>
              <td className={cellClassName}>
                <IconKeyLabel registry={foodTypeIcons} icon={foodType.icon} />
              </td>
              <td className={cellClassName}>{foodType.sortOrder}</td>
              <td className={cellClassName}>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    aria-label={`แก้ไขประเภทอาหาร ${foodType.name.th}`}
                    onClick={() => onEdit(foodType)}
                  >
                    <PencilSimple aria-hidden weight="bold" />
                    แก้ไข
                  </Button>
                  <Button
                    variant="secondary"
                    aria-label={`ลบประเภทอาหาร ${foodType.name.th}`}
                    onClick={() => onDelete(foodType)}
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
