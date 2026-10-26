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
  onChoose: (budget: Budget, advance?: boolean) => void
  onNext: () => void
  onBack?: (() => void) | undefined
  editing?: boolean
}

export function BudgetStep({
  value,
  headingRef,
  onChoose,
  onNext,
  onBack,
  editing = false,
}: BudgetStepProps) {
  return (
    <ChoiceStep
      number={1}
      title="มื้อนี้มีงบเท่าไหร่?"
      hint="งบต่อมื้อ"
      name="budget"
      options={budgetOptions}
      value={value}
      missingMessage={missingChoiceMessages.budget}
      headingRef={headingRef}
      onChange={(budget, advance) => onChoose(budget as Budget, advance)}
      onNext={onNext}
      onBack={onBack}
      editing={editing}
    />
  )
}
