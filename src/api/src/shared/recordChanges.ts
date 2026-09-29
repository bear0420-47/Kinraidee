// True when any supplied field differs from the stored record.
export function hasFieldChanges<Model extends object>(
  record: Model,
  changes: Partial<Model>,
) {
  return (Object.keys(changes) as (keyof Model)[]).some(
    (key) => changes[key] !== record[key],
  )
}
