import { IconMasterDataForm } from '@/components/IconMasterDataForm'
import { foodTypeIcons } from '@/lib/foodTypeIcons'
import type {
  CreateFoodTypeBody,
  FoodType,
} from '@/schemas/admin/food-types/foodTypeSchemas'

type FoodTypeFormProps = {
  foodType?: FoodType
  submitLabel: string
  onSubmit: (body: CreateFoodTypeBody) => Promise<unknown>
  onCancel: () => void
}

export function FoodTypeForm({ foodType, ...props }: FoodTypeFormProps) {
  return (
    <IconMasterDataForm
      idPrefix="food-type"
      entityLabel="ประเภทอาหาร"
      registry={foodTypeIcons}
      record={foodType}
      {...props}
    />
  )
}
