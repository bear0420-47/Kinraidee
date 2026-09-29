import { ApiError } from '@/api/apiError'

export type NameField = 'nameTh' | 'nameEn'

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
