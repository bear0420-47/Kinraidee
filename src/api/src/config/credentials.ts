import { z } from 'zod'

export const normalizedEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Email must be valid.')

export function createPasswordSchema(fieldName = 'Password') {
  return z
    .string()
    .trim()
    .min(8, `${fieldName} must contain at least 8 characters.`)
}
