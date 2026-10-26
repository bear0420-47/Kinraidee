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
  onChoose: (zoneId: string | null, advance?: boolean) => void
  onNext: () => void
  onBack: () => void
  editing?: boolean
}

// Zones are chosen by hand; there is no GPS or current-location option.
export function ZoneStep({
  zones,
  value,
  headingRef,
  onChoose,
  onNext,
  onBack,
  editing = false,
}: ZoneStepProps) {
  return (
    <ChoiceStep
      number={4}
      title="แถวไหนดี?"
      hint="โซนที่สะดวก"
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
      onChange={(choice, advance) => onChoose(fromChoiceValue(choice), advance)}
      onNext={onNext}
      onBack={onBack}
      editing={editing}
    />
  )
}
