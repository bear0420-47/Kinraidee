import { HttpError } from '@/shared/httpError'

const LOCALIZED_NAME_FIELDS: Record<string, string> = {
  nameTh: 'name.th',
  nameEn: 'name.en',
}

// Maps unique-constraint columns to request field paths so forms can mark the right input.
export function duplicateNameError(
  code: string,
  entityLabel: string,
  columns: string[],
) {
  const fields = columns.flatMap(
    (column) => LOCALIZED_NAME_FIELDS[column] ?? [],
  )
  const fieldMessage = `Already used by another ${entityLabel}.`

  return new HttpError({
    status: 409,
    code,
    message: `Another ${entityLabel} already uses this name.`,
    fields: Object.fromEntries(
      (fields.length > 0 ? fields : ['name']).map((field) => [
        field,
        fieldMessage,
      ]),
    ),
  })
}
