import { z } from 'zod'

import type { IconRegistry } from '@/lib/iconRegistry'
import {
  isSameLocalization,
  localizedNameFields,
  sortOrderField,
  type Localization,
} from '@/schemas/shared/masterDataFields'

// FoodType and Taste share one shape: localized name, optional icon key, and sortOrder.
export type IconMasterData = {
  name: Localization
  icon: string | null
  sortOrder: number
}

// The select offers only registry keys; the empty choice means "use the fallback icon".
export function createIconMasterDataFormSchema(registry: IconRegistry) {
  return z
    .object({
      ...localizedNameFields,
      icon: z.enum(['', ...registry.keys], 'กรุณาเลือกไอคอนจากรายการ'),
      sortOrder: sortOrderField,
    })
    .transform((values): IconMasterData => ({
      name: { th: values.nameTh, en: values.nameEn },
      icon: values.icon || null,
      sortOrder: values.sortOrder,
    }))
}

export type IconMasterDataFormInput = z.input<
  ReturnType<typeof createIconMasterDataFormSchema>
>

// A stored key outside the registry is shown as the fallback choice.
function toRegistryIcon(registry: IconRegistry, icon: string | null) {
  return registry.isKey(icon) ? icon : null
}

export function toIconMasterDataFormValues(
  registry: IconRegistry,
  record?: IconMasterData,
): IconMasterDataFormInput {
  return {
    nameTh: record?.name.th ?? '',
    nameEn: record?.name.en ?? '',
    icon: toRegistryIcon(registry, record?.icon ?? null) ?? '',
    sortOrder: record ? String(record.sortOrder) : '',
  }
}

// PATCH only what the admin changed; an untouched unknown icon key is left as stored.
export function getIconMasterDataChanges(
  registry: IconRegistry,
  record: IconMasterData,
  body: IconMasterData,
): Partial<IconMasterData> | null {
  const changes: Partial<IconMasterData> = {}

  if (!isSameLocalization(body.name, record.name)) changes.name = body.name
  if (body.icon !== toRegistryIcon(registry, record.icon)) {
    changes.icon = body.icon
  }
  if (body.sortOrder !== record.sortOrder) changes.sortOrder = body.sortOrder

  return Object.keys(changes).length > 0 ? changes : null
}
