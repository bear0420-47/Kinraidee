import type { UseQueryResult } from '@tanstack/react-query'
import type { Ref } from 'react'

import { TasteIcon } from '@/lib/tasteIcons'
import type { Taste } from '@/schemas/admin/tastes/tasteSchemas'
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

type TasteStepProps = {
  tastes: UseQueryResult<Taste[]>
  value: string | null | undefined
  headingRef: Ref<HTMLHeadingElement>
  onChoose: (tasteId: string | null, advance?: boolean) => void
  onNext: () => void
  onBack: () => void
  editing?: boolean
}

export function TasteStep({
  tastes,
  value,
  headingRef,
  onChoose,
  onNext,
  onBack,
  editing = false,
}: TasteStepProps) {
  const icon = (key: string | null) => (
    <TasteIcon aria-hidden icon={key} size={20} weight="bold" />
  )

  return (
    <ChoiceStep
      number={2}
      title="วันนี้อยากกินรสไหน?"
      hint="เลือก 1 ข้อ"
      name="taste"
      // Kept in API order (sortOrder), followed by the UI-only "any" choice.
      options={[
        ...(tastes.data ?? []).map((taste) => ({
          value: taste.id,
          label: taste.name.th,
          icon: icon(taste.icon),
        })),
        { value: ANY_CHOICE, label: ANY_LABEL, icon: icon(null) },
      ]}
      value={toChoiceValue(value)}
      missingMessage={missingChoiceMessages.taste}
      headingRef={headingRef}
      loadState={loadStateOf(tastes)}
      onRetry={() => void tastes.refetch()}
      onChange={(choice, advance) => onChoose(fromChoiceValue(choice), advance)}
      onNext={onNext}
      onBack={onBack}
      editing={editing}
    />
  )
}
