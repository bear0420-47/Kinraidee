import { useEffect, useRef, useState } from 'react'

import { Dialog } from '@/components/Dialog'
import { LeavePageDialog } from '@/components/LeavePageDialog'
import { MasterDataPageShell } from '@/components/MasterDataPageShell'
import { getLastPage, Pagination } from '@/components/Pagination'
import { QueryListState } from '@/components/QueryListState'
import { useFoodTypes } from '@/hooks/admin/food-types/useFoodTypes'
import { useImageFormGuard } from '@/hooks/admin/images/useImageFormGuard'
import {
  useBulkDeleteMenuItems,
  useBulkRestoreMenuItems,
  useDeleteMenuItem,
  useMenuItems,
  useRestoreMenuItem,
  useSaveMenuItem,
} from '@/hooks/admin/menu-items/useMenuItems'
import { useRestaurantOptions } from '@/hooks/admin/restaurants/useRestaurants'
import { useTastes } from '@/hooks/admin/tastes/useTastes'
import {
  defaultMenuItemFilters,
  isFilteringMenuItems,
  isRestaurantDeleted,
  toggleAllVisible,
  toggleSelection,
  type CreateMenuItemBody,
  type MenuItem,
  type MenuItemFilters as Filters,
} from '@/schemas/admin/menu-items/menuItemSchemas'
import { BulkMenuItemsDialog } from './components/BulkMenuItemsDialog'
import { DeleteMenuItemDialog } from './components/DeleteMenuItemDialog'
import { MenuItemBulkActions } from './components/MenuItemBulkActions'
import { MenuItemFilters } from './components/MenuItemFilters'
import { MenuItemForm } from './components/MenuItemForm'
import { MenuItemTable } from './components/MenuItemTable'
import { RestoreMenuItemDialog } from './components/RestoreMenuItemDialog'

type DialogState =
  | { mode: 'create' }
  | { mode: 'edit'; menuItem: MenuItem }
  | { mode: 'delete'; menuItem: MenuItem }
  | { mode: 'restore'; menuItem: MenuItem }
  | { mode: 'bulk-delete'; ids: string[] }
  | { mode: 'bulk-restore'; ids: string[] }

const CLEANUP_WARNING = 'ระบบลบรูปที่ไม่ได้ใช้แล้วไม่สำเร็จ'
const NO_SELECTION: ReadonlySet<string> = new Set()

export function MenuItemsPage() {
  const [filters, setFilters] = useState<Filters>(defaultMenuItemFilters)
  const menuItems = useMenuItems(filters)
  const restaurants = useRestaurantOptions()
  const foodTypes = useFoodTypes()
  const tastes = useTastes()
  const saveMenuItem = useSaveMenuItem()
  const deleteMenuItem = useDeleteMenuItem()
  const restoreMenuItem = useRestoreMenuItem()
  const bulkDelete = useBulkDeleteMenuItems()
  const bulkRestore = useBulkRestoreMenuItems()
  const [dialog, setDialog] = useState<DialogState | null>(null)
  const [selectedIds, setSelectedIds] = useState(NO_SELECTION)
  const [notice, setNotice] = useState('')
  const createButtonRef = useRef<HTMLButtonElement>(null)

  const isFormOpen = dialog?.mode === 'create' || dialog?.mode === 'edit'
  const guard = useImageFormGuard(isFormOpen)
  const { blocker } = guard

  const meta = menuItems.data?.meta
  const lastPage = meta ? getLastPage(meta.total, meta.pageSize) : 1
  // Deleting or restoring the last row of the last page leaves the query past the end.
  const isPastLastPage = Boolean(meta && meta.total > 0 && meta.page > lastPage)

  useEffect(() => {
    if (isPastLastPage) {
      setFilters((current) => ({ ...current, page: lastPage }))
    }
  }, [isPastLastPage, lastPage])

  // Selection covers the visible page only: it is cleared whenever the filters or page
  // change, and rows that leave the list after a refetch drop out of it.
  const visibleItems = menuItems.isPlaceholderData
    ? []
    : (menuItems.data?.items ?? [])
  const selectedItems = visibleItems.filter((menuItem) =>
    selectedIds.has(menuItem.id),
  )
  const visibleSelectedIds = new Set(selectedItems.map(({ id }) => id))
  const bulkRestoreBlocked = selectedItems.some(isRestaurantDeleted)

  function updateFilters(update: (current: Filters) => Filters) {
    setFilters(update)
    setSelectedIds(NO_SELECTION)
  }

  function changeFilters(changes: Partial<Omit<Filters, 'page'>>) {
    updateFilters((current) => ({ ...current, ...changes, page: 1 }))
  }

  function openDialog(next: DialogState) {
    setNotice('')
    guard.resetFormState()
    setDialog(next)
  }

  function finish(message: string) {
    setDialog(null)
    guard.resetFormState()
    setNotice(message)
  }

  async function discardPendingUpload() {
    if (!(await guard.discardPendingUpload())) setNotice(CLEANUP_WARNING)
  }

  function closeForm() {
    if (guard.isBusy) return
    void discardPendingUpload()
    setDialog(null)
    guard.resetFormState()
  }

  async function save(
    body: CreateMenuItemBody,
    pendingUploadKey: string | null,
    menuItem?: MenuItem,
  ) {
    const result = await saveMenuItem({ menuItem, body, pendingUploadKey })
    const message = !result.changed
      ? 'ไม่มีข้อมูลที่เปลี่ยนแปลง'
      : menuItem
        ? `บันทึกการแก้ไขเมนู ${body.name.th} แล้ว`
        : `เพิ่มเมนู ${body.name.th} แล้ว`
    finish(result.cleanupFailed ? `${message} · ${CLEANUP_WARNING}` : message)
  }

  async function confirmDelete(menuItem: MenuItem) {
    await deleteMenuItem.mutateAsync(menuItem.id)
    finish(`ลบเมนู ${menuItem.name.th} แล้ว`)
  }

  async function confirmRestore(menuItem: MenuItem) {
    await restoreMenuItem.mutateAsync(menuItem.id)
    finish(`กู้คืนเมนู ${menuItem.name.th} แล้ว`)
  }

  async function confirmBulk(action: 'delete' | 'restore', ids: string[]) {
    const updatedCount = await (action === 'delete'
      ? bulkDelete.mutateAsync(ids)
      : bulkRestore.mutateAsync(ids))
    setSelectedIds(NO_SELECTION)
    // Already-deleted (or already-active) items are left unchanged by the API.
    finish(
      action === 'delete'
        ? `ลบเมนูแล้ว ${updatedCount} รายการ`
        : `กู้คืนเมนูแล้ว ${updatedCount} รายการ`,
    )
  }

  const optionsFailed =
    restaurants.isError || foodTypes.isError || tastes.isError
  const activeRestaurants = (restaurants.data ?? []).filter(
    (restaurant) => restaurant.deletedAt === null,
  )
  const formOptions = {
    restaurants: activeRestaurants,
    foodTypes: foodTypes.data ?? [],
    tastes: tastes.data ?? [],
    optionsFailed,
  }

  return (
    <MasterDataPageShell
      title="จัดการเมนูอาหาร"
      width="extra-wide"
      note="เมนูที่ลบแล้วจะถูกซ่อนจากการสุ่มเมนู และกู้คืนได้เมื่อร้านอาหารของเมนูยังใช้งานอยู่"
      createLabel="เพิ่มเมนูอาหาร"
      onCreate={() => openDialog({ mode: 'create' })}
      createButtonRef={createButtonRef}
      notice={notice}
    >
      <MenuItemFilters
        filters={filters}
        restaurants={restaurants.data ?? []}
        foodTypes={foodTypes.data ?? []}
        tastes={tastes.data ?? []}
        onChange={changeFilters}
      />
      <MenuItemBulkActions
        selectedCount={selectedItems.length}
        restoreBlocked={bulkRestoreBlocked}
        onDelete={() =>
          openDialog({
            mode: 'bulk-delete',
            ids: selectedItems.map(({ id }) => id),
          })
        }
        onRestore={() =>
          openDialog({
            mode: 'bulk-restore',
            ids: selectedItems.map(({ id }) => id),
          })
        }
      />
      <QueryListState
        // While the page is being moved back into range, show loading rather than "empty".
        query={{
          ...menuItems,
          isPending: menuItems.isPending || isPastLastPage,
        }}
        items={menuItems.data?.items}
        loadingMessage="กำลังโหลดเมนูอาหาร…"
        errorMessage="โหลดรายการเมนูอาหารไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"
        emptyMessage={
          isFilteringMenuItems(filters)
            ? 'ไม่พบเมนูที่ตรงกับตัวกรอง'
            : 'ยังไม่มีเมนูอาหาร'
        }
      >
        {(items) => (
          <MenuItemTable
            menuItems={items}
            selectedIds={visibleSelectedIds}
            onToggle={(menuItem) =>
              setSelectedIds(toggleSelection(visibleSelectedIds, menuItem.id))
            }
            onToggleAll={() =>
              setSelectedIds(
                toggleAllVisible(
                  visibleSelectedIds,
                  items.map(({ id }) => id),
                ),
              )
            }
            onEdit={(menuItem) => openDialog({ mode: 'edit', menuItem })}
            onDelete={(menuItem) => openDialog({ mode: 'delete', menuItem })}
            onRestore={(menuItem) => openDialog({ mode: 'restore', menuItem })}
          />
        )}
      </QueryListState>
      {meta && meta.total > 0 && !isPastLastPage ? (
        <Pagination
          label="หน้ารายการเมนูอาหาร"
          page={meta.page}
          pageSize={meta.pageSize}
          total={meta.total}
          onPageChange={(page) =>
            updateFilters((current) => ({ ...current, page }))
          }
        />
      ) : null}

      {dialog?.mode === 'create' ? (
        <Dialog title="เพิ่มเมนูอาหาร" onClose={closeForm}>
          <MenuItemForm
            {...formOptions}
            submitLabel="เพิ่มเมนูอาหาร"
            onSave={(body, pendingUploadKey) => save(body, pendingUploadKey)}
            onCancel={closeForm}
            onStateChange={guard.trackFormState}
          />
        </Dialog>
      ) : null}
      {dialog?.mode === 'edit' ? (
        <Dialog title="แก้ไขเมนูอาหาร" onClose={closeForm}>
          <MenuItemForm
            {...formOptions}
            menuItem={dialog.menuItem}
            submitLabel="บันทึกการแก้ไข"
            onSave={(body, pendingUploadKey) =>
              save(body, pendingUploadKey, dialog.menuItem)
            }
            onCancel={closeForm}
            onStateChange={guard.trackFormState}
          />
        </Dialog>
      ) : null}
      {dialog?.mode === 'delete' ? (
        <DeleteMenuItemDialog
          menuItem={dialog.menuItem}
          onConfirm={() => confirmDelete(dialog.menuItem)}
          onClose={() => setDialog(null)}
          fallbackFocusRef={createButtonRef}
        />
      ) : null}
      {dialog?.mode === 'restore' ? (
        <RestoreMenuItemDialog
          menuItem={dialog.menuItem}
          onConfirm={() => confirmRestore(dialog.menuItem)}
          onClose={() => setDialog(null)}
          fallbackFocusRef={createButtonRef}
        />
      ) : null}
      {dialog?.mode === 'bulk-delete' || dialog?.mode === 'bulk-restore' ? (
        <BulkMenuItemsDialog
          action={dialog.mode === 'bulk-delete' ? 'delete' : 'restore'}
          count={dialog.ids.length}
          onConfirm={() =>
            confirmBulk(
              dialog.mode === 'bulk-delete' ? 'delete' : 'restore',
              dialog.ids,
            )
          }
          onClose={() => setDialog(null)}
          fallbackFocusRef={createButtonRef}
        />
      ) : null}
      {blocker.state === 'blocked' ? (
        <LeavePageDialog
          message="ข้อมูลเมนูที่ยังไม่บันทึกจะหายไป"
          onLeave={async () => {
            await discardPendingUpload()
            blocker.proceed()
          }}
          onStay={() => blocker.reset()}
        />
      ) : null}
    </MasterDataPageShell>
  )
}
