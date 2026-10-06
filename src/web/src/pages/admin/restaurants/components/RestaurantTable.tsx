import {
  ArrowCounterClockwise,
  CheckCircle,
  Prohibit,
} from '@phosphor-icons/react'

import { Button } from '@/components/Button'
import { ImagePreview } from '@/components/ImagePreview'
import { RowActions } from '@/components/RowActions'
import {
  actionsColumnClassName,
  bodyCellClassName,
  headerCellClassName,
} from '@/components/tableStyles'
import type { Restaurant } from '@/schemas/admin/restaurants/restaurantSchemas'

type RestaurantTableProps = {
  restaurants: Restaurant[]
  onEdit: (restaurant: Restaurant) => void
  onDelete: (restaurant: Restaurant) => void
  onRestore: (restaurant: Restaurant) => void
}

const headers = [
  'ชื่อภาษาไทย',
  'ชื่อภาษาอังกฤษ',
  'โซน',
  'เบอร์โทร',
  'รูป',
  'สถานะ',
]

// Short fixed labels never break mid-word in a narrow column.
function MutedText({ children }: { children: string }) {
  return <span className="whitespace-nowrap text-muted">{children}</span>
}

// Status uses an icon and text, never colour alone.
function RestaurantStatus({ deleted }: { deleted: boolean }) {
  return deleted ? (
    <span className="inline-flex items-center gap-2 whitespace-nowrap font-bold text-rust">
      <Prohibit aria-hidden size={20} weight="bold" />
      ลบแล้ว
    </span>
  ) : (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <CheckCircle aria-hidden size={20} weight="bold" />
      ใช้งาน
    </span>
  )
}

export function RestaurantTable({
  restaurants,
  onEdit,
  onDelete,
  onRestore,
}: RestaurantTableProps) {
  return (
    <div className="overflow-x-auto rounded-md border-2 border-paper">
      <table className="w-full min-w-[56rem] text-left">
        <caption className="sr-only">รายการร้านอาหาร</caption>
        <thead className="bg-peach-deep text-small">
          <tr>
            {headers.map((header) => (
              <th key={header} scope="col" className={headerCellClassName}>
                {header}
              </th>
            ))}
            <th
              scope="col"
              className={`${headerCellClassName} ${actionsColumnClassName}`}
            >
              การจัดการ
            </th>
          </tr>
        </thead>
        <tbody>
          {restaurants.map((restaurant) => {
            const deleted = restaurant.deletedAt !== null

            return (
              <tr
                key={restaurant.id}
                className={deleted ? 'bg-canvas-soft' : ''}
              >
                <th scope="row" className={`${bodyCellClassName} font-bold`}>
                  {restaurant.name.th}
                </th>
                <td className={bodyCellClassName}>{restaurant.name.en}</td>
                <td className={bodyCellClassName}>{restaurant.zone.name.th}</td>
                <td className={bodyCellClassName}>
                  {restaurant.phone ?? <MutedText>ไม่มี</MutedText>}
                </td>
                <td className={bodyCellClassName}>
                  {restaurant.imageUrl ? (
                    <ImagePreview
                      url={restaurant.imageUrl}
                      alt=""
                      size="thumbnail"
                    />
                  ) : (
                    <MutedText>ไม่มีรูป</MutedText>
                  )}
                </td>
                <td className={bodyCellClassName}>
                  <RestaurantStatus deleted={deleted} />
                </td>
                <td
                  className={`${bodyCellClassName} ${actionsColumnClassName}`}
                >
                  {deleted ? (
                    // A deleted restaurant must be restored before it can be edited.
                    <div className="flex justify-center">
                      <Button
                        variant="secondary"
                        aria-label={`กู้คืนร้าน ${restaurant.name.th}`}
                        onClick={() => onRestore(restaurant)}
                      >
                        <ArrowCounterClockwise aria-hidden weight="bold" />
                        กู้คืน
                      </Button>
                    </div>
                  ) : (
                    <RowActions
                      entityLabel="ร้าน"
                      name={restaurant.name.th}
                      onEdit={() => onEdit(restaurant)}
                      onDelete={() => onDelete(restaurant)}
                    />
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
