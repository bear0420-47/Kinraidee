import { z } from 'zod'

const ICON_KEY_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

// Stores a key the web resolves through its icon registry, never SVG, HTML, or URLs.
export const iconKeySchema = z
  .string()
  .trim()
  .max(50, 'Must be at most 50 characters.')
  .refine((value) => value === '' || ICON_KEY_PATTERN.test(value), {
    message: 'Use a lowercase icon key such as "bowl-food".',
  })
  .transform((value) => value || null)
  .nullable()
