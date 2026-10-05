import type { Ref } from 'react'

import {
  budgetOptions,
  missingChoiceMessages,
  type Budget,
} from '@/schemas/meal/recommendationSchemas'
import { ChoiceStep } from './ChoiceStep'

type BudgetStepProps = {
  value: Budget | undefined
  headingRef: Ref<HTMLHeadingElement>
  onChoose: (budget: Budget) => void
  onNext: () => void
}

export function BudgetStep({
  value,
  headingRef,
  onChoose,
  onNext,
}: BudgetStepProps) {
  return (
    <ChoiceStep
      number={1}
      title="เลือกงบประมาณ"
      hint="ต่อหนึ่งมื้อ"
      name="budget"
      options={budgetOptions}
      value={value}
      missingMessage={missingChoiceMessages.budget}
      headingRef={headingRef}
      onChange={(budget) => onChoose(budget as Budget)}
      onNext={onNext}
    />
  )
}
