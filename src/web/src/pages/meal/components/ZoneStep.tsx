import type { UseQueryResult } from '@tanstack/react-query'
import type { Ref } from 'react'

import type { Zone } from '@/schemas/admin/zones/zoneSchemas'
import {
  ANY_ZONE_LABEL,
  missingChoiceMessages,
} from '@/schemas/meal/recommendationSchemas'
import {
  ANY_CHOICE,
  ChoiceStep,
  fromChoiceValue,
  loadStateOf,
  toChoiceValue,
} from './ChoiceStep'

type ZoneStepProps = {
  zones: UseQueryResult<Zone[]>
  value: string | null | undefined
  headingRef: Ref<HTMLHeadingElement>
  onChoose: (zoneId: string | null) => void
  onNext: () => void
  onBack: () => void
}

// Zones are chosen by hand; there is no GPS or current-location option.
export function ZoneStep({
  zones,
  value,
  headingRef,
  onChoose,
  onNext,
  onBack,
}: ZoneStepProps) {
  return (
    <ChoiceStep
      number={4}
      title="เลือกพื้นที่"
      hint="เลือกด้วยตัวเอง"
      name="zone"
      // Kept in API order (sortOrder), followed by the UI-only "anywhere" choice.
      options={[
        ...(zones.data ?? []).map((zone) => ({
          value: zone.id,
          label: zone.name.th,
        })),
        { value: ANY_CHOICE, label: ANY_ZONE_LABEL },
      ]}
      value={toChoiceValue(value)}
      missingMessage={missingChoiceMessages.zone}
      headingRef={headingRef}
      loadState={loadStateOf(zones)}
      onRetry={() => void zones.refetch()}
      onChange={(choice) => onChoose(fromChoiceValue(choice))}
      onNext={onNext}
      onBack={onBack}
    />
  )
}
