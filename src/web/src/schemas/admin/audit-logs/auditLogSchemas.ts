import type { components, paths } from '@/api/openapiTypes'

export type AuditLog =
  components['schemas']['AuditLogListEnvelope']['data']['items'][number]
export type AuditLogMeta = components['schemas']['AuditLogListEnvelope']['meta']
export type AuditLogFilters = NonNullable<
  paths['/api/audit-logs']['get']['parameters']['query']
>

export const auditEntityTypes = [
  'ZONE',
  'RESTAURANT',
  'FOOD_TYPE',
  'TASTE',
  'MENU_ITEM',
] as const

export const auditActions = ['CREATE', 'UPDATE', 'DELETE'] as const

// Thai labels for the API's enum values, shown in the table and the filters.
export const auditEntityTypeLabels: Record<AuditLog['entityType'], string> = {
  ZONE: 'โซน',
  RESTAURANT: 'ร้านอาหาร',
  FOOD_TYPE: 'ประเภทอาหาร',
  TASTE: 'รสชาติ',
  MENU_ITEM: 'เมนูอาหาร',
}

export const auditActionLabels: Record<AuditLog['action'], string> = {
  CREATE: 'เพิ่ม',
  UPDATE: 'แก้ไข',
  DELETE: 'ลบ',
}

export function toIsoDateTime(value: string) {
  return value ? new Date(value).toISOString() : undefined
}
