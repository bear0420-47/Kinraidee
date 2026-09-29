import { RowActions } from '@/components/RowActions'
import {
  actionsColumnClassName,
  bodyCellClassName,
  headerCellClassName,
  numberColumnClassName,
} from '@/components/tableStyles'
import type { Zone } from '@/schemas/admin/zones/zoneSchemas'

type ZoneTableProps = {
  zones: Zone[]
  onEdit: (zone: Zone) => void
  onDelete: (zone: Zone) => void
}

function OptionalText({ value }: { value: string | undefined }) {
  return value ? value : <span className="text-muted">ไม่มี</span>
}

export function ZoneTable({ zones, onEdit, onDelete }: ZoneTableProps) {
  return (
    <div className="overflow-x-auto rounded-md border-2 border-paper">
      <table className="w-full min-w-[48rem] text-left">
        <caption className="sr-only">รายการโซน</caption>
        <thead className="bg-peach-deep text-small">
          <tr>
            <th scope="col" className={headerCellClassName}>
              ชื่อภาษาไทย
            </th>
            <th scope="col" className={headerCellClassName}>
              ชื่อภาษาอังกฤษ
            </th>
            <th scope="col" className={headerCellClassName}>
              คำอธิบายภาษาไทย
            </th>
            <th scope="col" className={headerCellClassName}>
              คำอธิบายภาษาอังกฤษ
            </th>
            <th
              scope="col"
              className={`${headerCellClassName} ${numberColumnClassName}`}
            >
              ลำดับ
            </th>
            <th
              scope="col"
              className={`${headerCellClassName} ${actionsColumnClassName}`}
            >
              การจัดการ
            </th>
          </tr>
        </thead>
        <tbody>
          {zones.map((zone) => (
            <tr key={zone.id}>
              <th scope="row" className={`${bodyCellClassName} font-bold`}>
                {zone.name.th}
              </th>
              <td className={bodyCellClassName}>{zone.name.en}</td>
              <td className={bodyCellClassName}>
                <OptionalText value={zone.description?.th} />
              </td>
              <td className={bodyCellClassName}>
                <OptionalText value={zone.description?.en} />
              </td>
              <td className={`${bodyCellClassName} ${numberColumnClassName}`}>
                {zone.sortOrder}
              </td>
              <td className={`${bodyCellClassName} ${actionsColumnClassName}`}>
                <RowActions
                  entityLabel="โซน"
                  name={zone.name.th}
                  onEdit={() => onEdit(zone)}
                  onDelete={() => onDelete(zone)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
