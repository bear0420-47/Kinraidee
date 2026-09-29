import { IconMasterDataTable } from '@/components/IconMasterDataTable'
import { foodTypeIcons } from '@/lib/foodTypeIcons'
import type { FoodType } from '@/schemas/admin/food-types/foodTypeSchemas'

type FoodTypeTableProps = {
  foodTypes: FoodType[]
  onEdit: (foodType: FoodType) => void
  onDelete: (foodType: FoodType) => void
}

export function FoodTypeTable({ foodTypes, ...props }: FoodTypeTableProps) {
  return (
    <IconMasterDataTable
      entityLabel="ประเภทอาหาร"
      registry={foodTypeIcons}
      items={foodTypes}
      {...props}
    />
  )
}
