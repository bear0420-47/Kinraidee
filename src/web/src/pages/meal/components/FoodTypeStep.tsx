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
  onChoose: (foodTypeId: string | null, advance?: boolean) => void
  onNext: () => void
  onBack: () => void
  editing?: boolean
}

export function FoodTypeStep({
  foodTypes,
  value,
  headingRef,
  onChoose,
  onNext,
  onBack,
  editing = false,
}: FoodTypeStepProps) {
  const icon = (key: string | null) => (
    <FoodTypeIcon aria-hidden icon={key} size={20} weight="bold" />
  )

  return (
    <ChoiceStep
      number={3}
      title="อยากกินแนวไหน?"
      hint="เลือก 1 ข้อ"
      name="foodType"
      previewCount={6}
      moreOptionsLabel="ดูประเภทอื่น"
      // Any comes first; master-data records retain API sortOrder.
      options={[
        { value: ANY_CHOICE, label: ANY_LABEL, icon: icon(null) },
        ...(foodTypes.data ?? []).map((foodType) => ({
          value: foodType.id,
          label: foodType.name.th,
          icon: icon(foodType.icon),
        })),
      ]}
      value={toChoiceValue(value)}
      missingMessage={missingChoiceMessages.foodType}
      headingRef={headingRef}
      loadState={loadStateOf(foodTypes)}
      onRetry={() => void foodTypes.refetch()}
      onChange={(choice, advance) => onChoose(fromChoiceValue(choice), advance)}
      onNext={onNext}
      onBack={onBack}
      editing={editing}
    />
  )
}
