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
      title="มื้อนี้อยากกินแบบไหน?"
      hint="เลือกรสหรือสัมผัสที่อยากได้ที่สุด 1 ข้อ"
      name="taste"
      previewCount={6}
      moreOptionsLabel="ดูรสชาติอื่น"
      // Any comes first; master-data records retain API sortOrder.
      options={[
        { value: ANY_CHOICE, label: ANY_LABEL, icon: icon(null) },
        ...(tastes.data ?? []).map((taste) => ({
          value: taste.id,
          label: taste.name.th,
          icon: icon(taste.icon),
        })),
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
