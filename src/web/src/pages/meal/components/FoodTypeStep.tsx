import type { UseQueryResult } from '@tanstack/react-query'
import type { Ref } from 'react'

import { FoodTypeIcon } from '@/lib/foodTypeIcons'
import type { FoodType } from '@/schemas/admin/food-types/foodTypeSchemas'
import {
  ANY_LABEL,
  missingChoiceMessages,
} from '@/schemas/meal/recommendationSchemas'
import {
  ANY_CHOICE,
  ChoiceStep,
  fromChoiceValue,
  loadStateOf,
  toChoiceValue,
} from './ChoiceStep'

type FoodTypeStepProps = {
  foodTypes: UseQueryResult<FoodType[]>
  value: string | null | undefined
  headingRef: Ref<HTMLHeadingElement>
  onChoose: (foodTypeId: string | null) => void
  onNext: () => void
  onBack: () => void
}

export function FoodTypeStep({
  foodTypes,
  value,
  headingRef,
  onChoose,
  onNext,
  onBack,
}: FoodTypeStepProps) {
  const icon = (key: string | null) => (
    <FoodTypeIcon aria-hidden icon={key} size={20} weight="bold" />
  )

  return (
    <ChoiceStep
      number={3}
      title="เลือกประเภทอาหาร"
      hint="เลือก 1 ข้อ"
      name="foodType"
      // Kept in API order (sortOrder), followed by the UI-only "any" choice.
      options={[
        ...(foodTypes.data ?? []).map((foodType) => ({
          value: foodType.id,
          label: foodType.name.th,
          icon: icon(foodType.icon),
        })),
        { value: ANY_CHOICE, label: ANY_LABEL, icon: icon(null) },
      ]}
      value={toChoiceValue(value)}
      missingMessage={missingChoiceMessages.foodType}
      headingRef={headingRef}
      loadState={loadStateOf(foodTypes)}
      onRetry={() => void foodTypes.refetch()}
      onChange={(choice) => onChoose(fromChoiceValue(choice))}
      onNext={onNext}
      onBack={onBack}
    />
  )
}
