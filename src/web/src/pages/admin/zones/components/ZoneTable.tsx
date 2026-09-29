import { PencilSimple, Trash } from '@phosphor-icons/react'

import { Button } from '@/components/Button'
import type { Zone } from '@/schemas/admin/zones/zoneSchemas'

type ZoneTableProps = {
  zones: Zone[]
  onEdit: (zone: Zone) => void
  onDelete: (zone: Zone) => void
}

const cellClassName = 'border-t-2 border-line-soft px-4 py-3 align-top'

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
            <th scope="col" className="px-4 py-3">
              ชื่อภาษาไทย
            </th>
            <th scope="col" className="px-4 py-3">
              ชื่อภาษาอังกฤษ
            </th>
            <th scope="col" className="px-4 py-3">
              คำอธิบายภาษาไทย
            </th>
            <th scope="col" className="px-4 py-3">
              คำอธิบายภาษาอังกฤษ
            </th>
            <th scope="col" className="px-4 py-3">
              ลำดับ
            </th>
            <th scope="col" className="px-4 py-3">
              การจัดการ
            </th>
          </tr>
        </thead>
        <tbody>
          {zones.map((zone) => (
            <tr key={zone.id}>
              <th scope="row" className={`${cellClassName} font-bold`}>
                {zone.name.th}
              </th>
              <td className={cellClassName}>{zone.name.en}</td>
              <td className={cellClassName}>
                <OptionalText value={zone.description?.th} />
              </td>
              <td className={cellClassName}>
                <OptionalText value={zone.description?.en} />
              </td>
              <td className={cellClassName}>{zone.sortOrder}</td>
              <td className={cellClassName}>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    aria-label={`แก้ไขโซน ${zone.name.th}`}
                    onClick={() => onEdit(zone)}
                  >
                    <PencilSimple aria-hidden weight="bold" />
                    แก้ไข
                  </Button>
                  <Button
                    variant="secondary"
                    aria-label={`ลบโซน ${zone.name.th}`}
                    onClick={() => onDelete(zone)}
                  >
                    <Trash aria-hidden weight="bold" />
                    ลบ
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
