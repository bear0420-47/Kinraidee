import type { UseFormSetError } from 'react-hook-form'

import { ApiError } from '@/api/apiError'

type NameField = 'nameTh' | 'nameEn'

const NAME_FIELDS: Record<string, NameField> = {
  'name.th': 'nameTh',
  'name.en': 'nameEn',
}

// Admin forms use flat field names; the API reports duplicates as `name.th`/`name.en`.
export function getDuplicateNameFields(error: unknown): NameField[] | null {
  if (!(error instanceof ApiError) || error.status !== 409) return null

  const fields = Object.keys(error.fields).flatMap(
    (field) => NAME_FIELDS[field] ?? [],
  )
  return fields.length > 0 ? fields : ['nameTh', 'nameEn']
}

// Marks the duplicated name fields and focuses the first; returns false for other errors.
export function showDuplicateNameErrors(
  error: unknown,
  setError: UseFormSetError<Record<NameField, string>>,
  message: string,
) {
  const fields = getDuplicateNameFields(error)
  if (!fields) return false

  fields.forEach((field, index) =>
    setError(field, { message }, { shouldFocus: index === 0 }),
  )
  return true
}
