import { IconKeyLabel } from '@/components/IconKeyLabel'
import { RowActions } from '@/components/RowActions'
import {
  actionsColumnClassName,
  bodyCellClassName,
  headerCellClassName,
  numberColumnClassName,
} from '@/components/tableStyles'
import { foodTypeIcons } from '@/lib/foodTypeIcons'
import type { FoodType } from '@/schemas/admin/food-types/foodTypeSchemas'

type FoodTypeTableProps = {
  foodTypes: FoodType[]
  onEdit: (foodType: FoodType) => void
  onDelete: (foodType: FoodType) => void
}

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
          {foodTypes.map((foodType) => (
            <tr key={foodType.id}>
              <th scope="row" className={`${bodyCellClassName} font-bold`}>
                {foodType.name.th}
              </th>
              <td className={bodyCellClassName}>{foodType.name.en}</td>
              <td className={bodyCellClassName}>
                <IconKeyLabel registry={foodTypeIcons} icon={foodType.icon} />
              </td>
              <td className={`${bodyCellClassName} ${numberColumnClassName}`}>
                {foodType.sortOrder}
              </td>
              <td className={`${bodyCellClassName} ${actionsColumnClassName}`}>
                <RowActions
                  entityLabel="ประเภทอาหาร"
                  name={foodType.name.th}
                  onEdit={() => onEdit(foodType)}
                  onDelete={() => onDelete(foodType)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
