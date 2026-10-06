import {
  bodyCellClassName,
  headerCellClassName,
} from '@/components/tableStyles'
import {
  type AuditLog,
  auditActionLabels,
  auditEntityTypeLabels,
} from '@/schemas/admin/audit-logs/auditLogSchemas'
import { AuditSnapshot } from './AuditSnapshot'

export function AuditLogTable({ items }: { items: AuditLog[] }) {
  return (
    <div className="overflow-x-auto rounded-sm border-2 border-paper">
      <table
        className="w-full min-w-[980px] border-collapse text-left text-small"
        aria-label="รายการบันทึกการแก้ไขระบบ"
      >
        <thead className="bg-cream">
          <tr>
            <th className={headerCellClassName} scope="col">
              เวลา
            </th>
            <th className={headerCellClassName} scope="col">
              การทำงาน
            </th>
            <th className={headerCellClassName} scope="col">
              ข้อมูล
            </th>
            <th className={headerCellClassName} scope="col">
              ผู้ดำเนินการ
            </th>
            <th className={headerCellClassName} scope="col">
              Request ID
            </th>
            <th className={headerCellClassName} scope="col">
              รายละเอียด
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td className={`${bodyCellClassName} whitespace-nowrap`}>
                {new Date(item.createdAt).toLocaleString('th-TH')}
              </td>
              <td className={bodyCellClassName}>
                {auditActionLabels[item.action]}
              </td>
              <td className={bodyCellClassName}>
                <strong>{auditEntityTypeLabels[item.entityType]}</strong>
                <br />
                <span className="break-all text-muted">{item.entityId}</span>
              </td>
              <td className={`${bodyCellClassName} break-all`}>
                {item.actorId ?? 'บัญชีถูกลบแล้ว'}
              </td>
              <td className={`${bodyCellClassName} break-all`}>
                {item.requestId}
              </td>
              <td className={`${bodyCellClassName} min-w-72`}>
                <div className="flex flex-col gap-2">
                  <AuditSnapshot label="ก่อนแก้ไข" value={item.before} />
                  <AuditSnapshot label="หลังแก้ไข" value={item.after} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
