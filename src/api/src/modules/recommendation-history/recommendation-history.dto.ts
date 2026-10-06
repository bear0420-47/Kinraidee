import { Prisma } from '@prisma/client'
import { z } from 'zod'

import {
  isAvailableMenuItem,
  menuItemSummarySchema,
  toMenuItemSummary,
} from '@/modules/menu-items/menu-items.summary'
import { parseWithSchema } from '@/shared/validation'

// Only the chosen MenuItem: no conditions, rejected IDs, shortlist, or user ID.
export const recordHistorySchema = z
  .object({ menuItemId: z.string().trim().min(1) })
  .strict()

export const historyListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict()

export const historyRecordSchema = z.object({
  id: z.string(),
  menuItemId: z.string(),
  selectedAt: z.iso.datetime(),
})

export const historyItemSchema = historyRecordSchema.extend({
  available: z.boolean(),
  menuItem: menuItemSummarySchema,
})

export const historyEnvelopeSchema = z.object({
  data: z.object({ history: historyRecordSchema }),
})

export const historyListEnvelopeSchema = z.object({
  data: z.object({ items: z.array(historyItemSchema) }),
  meta: z.object({
    page: z.number().int().positive(),
    pageSize: z.number().int().positive().max(100),
    total: z.number().int().nonnegative(),
  }),
})

export const historyWithMenuItem =
  Prisma.validator<Prisma.RecommendationHistoryDefaultArgs>()({
    include: { menuItem: { include: { restaurant: true } } },
  })

export type HistoryWithMenuItem = Prisma.RecommendationHistoryGetPayload<
  typeof historyWithMenuItem
>
export type HistoryListQuery = z.output<typeof historyListQuerySchema>
export type HistoryRecord = z.infer<typeof historyRecordSchema>
export type HistoryItem = z.infer<typeof historyItemSchema>

export function parseRecordHistory(input: unknown) {
  return parseWithSchema(recordHistorySchema, input).menuItemId
}

export function parseHistoryListQuery(input: unknown) {
  return parseWithSchema(historyListQuerySchema, input)
}

export function toHistoryRecord(row: {
  id: string
  menuItemId: string
  selectedAt: Date
}): HistoryRecord {
  return {
    id: row.id,
    menuItemId: row.menuItemId,
    selectedAt: row.selectedAt.toISOString(),
  }
}

export function toHistoryItem(row: HistoryWithMenuItem): HistoryItem {
  return {
    ...toHistoryRecord(row),
    available: isAvailableMenuItem(row.menuItem),
    menuItem: toMenuItemSummary(row.menuItem),
  }
}
