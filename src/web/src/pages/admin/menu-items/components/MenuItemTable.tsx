import {
  ArrowCounterClockwise,
  CheckCircle,
  Prohibit,
  Storefront,
} from '@phosphor-icons/react'
import { useEffect, useRef } from 'react'

import { Button } from '@/components/Button'
import { ImageLightbox } from '@/components/ImageLightbox'
import { RowActions } from '@/components/RowActions'
import {
  actionsColumnClassName,
  bodyCellClassName,
  headerCellClassName,
  numberColumnClassName,
} from '@/components/tableStyles'
import { FoodTypeIcon } from '@/lib/foodTypeIcons'
import { formatPrice } from '@/lib/formatPrice'
import { TasteIcon } from '@/lib/tasteIcons'
import {
  isMenuItemDeleted,
  isRestaurantDeleted,
  MAX_BULK_SELECTION,
  type MenuItem,
} from '@/schemas/admin/menu-items/menuItemSchemas'

type MenuItemTableProps = {
  menuItems: MenuItem[]
  selectedIds: ReadonlySet<string>
  onToggle: (menuItem: MenuItem) => void
  onToggleAll: () => void
  onEdit: (menuItem: MenuItem) => void
  onDelete: (menuItem: MenuItem) => void
  onRestore: (menuItem: MenuItem) => void
}

// Fixed-content columns shrink to fit (`w-px`) and tastes wrap within a set width, so the
// spare width goes to the menu and Restaurant names, which vary most in length.
const columns = [
  { label: 'รูป', className: 'w-px' },
  { label: 'เมนู', className: 'min-w-44' },
  { label: 'ร้านอาหาร', className: 'min-w-32' },
  { label: 'ประเภทอาหาร', className: 'w-px whitespace-nowrap' },
  { label: 'รสชาติ', className: 'w-44' },
]

const checkboxClassName = 'h-5 w-5 accent-paper'

// Status uses icons and text, never colour alone. A row can be deleted itself, sit under a
// deleted Restaurant, or both.
function MenuItemStatus({ menuItem, id }: { menuItem: MenuItem; id: string }) {
  const deleted = isMenuItemDeleted(menuItem)
  const restaurantDeleted = isRestaurantDeleted(menuItem)

  return (
    <span id={id} className="flex flex-col gap-1">
      {deleted ? (
        <span className="inline-flex items-center gap-2 whitespace-nowrap font-bold text-rust">
          <Prohibit aria-hidden size={20} weight="bold" />
          ลบแล้ว
        </span>
      ) : null}
      {restaurantDeleted ? (
        <span className="inline-flex items-center gap-2 whitespace-nowrap font-bold text-rust">
          <Storefront aria-hidden size={20} weight="bold" />
          ร้านถูกลบ
        </span>
      ) : null}
      {restaurantDeleted && !deleted ? (
        // Rare: the item outlived its Restaurant's deletion, so say why it cannot be edited.
        <span className="text-small">กรุณากู้คืนร้านก่อนแก้ไข</span>
      ) : null}
      {!deleted && !restaurantDeleted ? (
        <span className="inline-flex items-center gap-2 whitespace-nowrap">
          <CheckCircle aria-hidden size={20} weight="bold" />
          ใช้งาน
        </span>
      ) : null}
    </span>
  )
}

function SelectAllCheckbox({
  menuItems,
  selectedIds,
  onToggleAll,
}: Pick<MenuItemTableProps, 'menuItems' | 'selectedIds' | 'onToggleAll'>) {
  const ref = useRef<HTMLInputElement>(null)
  const selectedCount = menuItems.filter((menuItem) =>
    selectedIds.has(menuItem.id),
  ).length
  const allSelected = selectedCount === menuItems.length
  const someSelected = selectedCount > 0 && !allSelected

  // `indeterminate` exists only as a DOM property.
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = someSelected
  }, [someSelected])

  return (
    <input
      ref={ref}
      type="checkbox"
      aria-label="เลือกเมนูทั้งหมดในหน้านี้"
      className={checkboxClassName}
      checked={allSelected}
      onChange={onToggleAll}
    />
  )
}

export function MenuItemTable({
  menuItems,
  selectedIds,
  onToggle,
  onToggleAll,
  onEdit,
  onDelete,
  onRestore,
}: MenuItemTableProps) {
  const selectionFull = selectedIds.size >= MAX_BULK_SELECTION

  return (
    <div className="overflow-x-auto rounded-md border-2 border-paper">
      <table className="w-full min-w-[60rem] text-left">
        <caption className="sr-only">รายการเมนูอาหาร</caption>
        <thead className="bg-peach-deep text-small">
          <tr>
            <th scope="col" className={`${headerCellClassName} w-px`}>
              <SelectAllCheckbox
                menuItems={menuItems}
                selectedIds={selectedIds}
                onToggleAll={onToggleAll}
              />
            </th>
            {columns.map(({ label, className }) => (
              <th
                key={label}
                scope="col"
                className={`${headerCellClassName} ${className}`}
              >
                {label}
              </th>
            ))}
            <th
              scope="col"
              className={`${headerCellClassName} ${numberColumnClassName} w-px`}
            >
              ราคา
            </th>
            <th scope="col" className={`${headerCellClassName} w-px`}>
              สถานะ
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
          {menuItems.map((menuItem) => {
            const deleted = isMenuItemDeleted(menuItem)
            const restaurantDeleted = isRestaurantDeleted(menuItem)
            const selected = selectedIds.has(menuItem.id)
            const statusId = `menu-item-status-${menuItem.id}`

            return (
              <tr
                key={menuItem.id}
                className={deleted || restaurantDeleted ? 'bg-canvas-soft' : ''}
              >
                <td className={bodyCellClassName}>
                  <input
                    type="checkbox"
                    aria-label={`เลือกเมนู ${menuItem.name.th}`}
                    className={checkboxClassName}
                    checked={selected}
                    // At the bulk limit, only already-selected rows can change.
                    disabled={!selected && selectionFull}
                    onChange={() => onToggle(menuItem)}
                  />
                </td>
                <td className={bodyCellClassName}>
                  {menuItem.imageUrl ? (
                    <ImageLightbox
                      url={menuItem.imageUrl}
                      name={menuItem.name.th}
                    />
                  ) : (
                    <span className="flex h-20 w-20 items-center justify-center rounded-sm border-2 border-dashed border-line-soft text-center text-small text-muted">
                      ไม่มีรูป
                    </span>
                  )}
                </td>
                <th scope="row" className={bodyCellClassName}>
                  <span className="block font-bold">{menuItem.name.th}</span>
                  <span lang="en" className="block text-small text-muted">
                    {menuItem.name.en}
                  </span>
                </th>
                <td className={bodyCellClassName}>
                  {menuItem.restaurant.name.th}
                </td>
                <td className={bodyCellClassName}>
                  <span className="inline-flex items-center gap-2 whitespace-nowrap">
                    <FoodTypeIcon
                      aria-hidden
                      icon={menuItem.foodType.icon}
                      size={20}
                      weight="bold"
                    />
                    {menuItem.foodType.name.th}
                  </span>
                </td>
                <td className={bodyCellClassName}>
                  <ul className="flex flex-wrap gap-2">
                    {menuItem.tastes.map((taste) => (
                      <li
                        key={taste.id}
                        className="inline-flex items-center gap-1 whitespace-nowrap rounded-pill border-2 border-line-soft px-2 text-small"
                      >
                        <TasteIcon
                          aria-hidden
                          icon={taste.icon}
                          size={16}
                          weight="bold"
                        />
                        {taste.name.th}
                      </li>
                    ))}
                  </ul>
                </td>
                <td
                  className={`${bodyCellClassName} ${numberColumnClassName} whitespace-nowrap`}
                >
                  {formatPrice(menuItem.price)}
                </td>
                <td className={bodyCellClassName}>
                  <MenuItemStatus menuItem={menuItem} id={statusId} />
                </td>
                <td
                  className={`${bodyCellClassName} ${actionsColumnClassName}`}
                >
                  {deleted ? (
                    // A deleted item must be restored before it can be edited.
                    <div className="flex justify-center">
                      <Button
                        variant="soft"
                        size="compact"
                        aria-label={`กู้คืนเมนู ${menuItem.name.th}`}
                        onClick={() => onRestore(menuItem)}
                      >
                        <ArrowCounterClockwise aria-hidden weight="bold" />
                        กู้คืน
                      </Button>
                    </div>
                  ) : (
                    <RowActions
                      entityLabel="เมนู"
                      size="compact"
                      name={menuItem.name.th}
                      onEdit={() => onEdit(menuItem)}
                      onDelete={() => onDelete(menuItem)}
                      // Under a deleted Restaurant, the Restaurant must be restored first.
                      editBlockedReasonId={
                        restaurantDeleted ? statusId : undefined
                      }
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
