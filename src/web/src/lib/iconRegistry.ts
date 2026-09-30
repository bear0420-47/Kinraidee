import type { Icon } from '@phosphor-icons/react'

export type IconOption = { label: string; Icon: Icon }

// Database icon values are only keys; they resolve to Phosphor components through a fixed map,
// never by dynamic import, and anything unknown or null uses the fallback.
export function createIconRegistry<const Key extends string>(
  options: Record<Key, IconOption>,
  fallback: Icon,
) {
  function isKey(value: string | null): value is Key {
    return value !== null && Object.hasOwn(options, value)
  }

  return {
    keys: Object.keys(options) as Key[],
    options,
    fallback,
    isKey,
    resolve: (value: string | null) =>
      isKey(value) ? options[value].Icon : fallback,
    labelOf: (value: string | null) =>
      isKey(value) ? options[value].label : null,
  }
}

export type IconRegistry = ReturnType<typeof createIconRegistry<string>>
