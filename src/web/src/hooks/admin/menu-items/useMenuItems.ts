import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { ApiError } from '@/api/apiError'
import { apiClient } from '@/api/client'
import { saveWithImageCleanup } from '@/hooks/admin/images/saveWithImageCleanup'
import {
  getMenuItemChanges,
  toMenuItemListQuery,
  type CreateMenuItemBody,
  type MenuItem,
  type MenuItemFilters,
  type UpdateMenuItemBody,
} from '@/schemas/admin/menu-items/menuItemSchemas'

export const menuItemsQueryKey = ['menu-items'] as const

export function useMenuItems(filters: MenuItemFilters) {
  const query = toMenuItemListQuery(filters)

  return useQuery({
    queryKey: [...menuItemsQueryKey, query],
    queryFn: async () => {
      const { data, error, response } = await apiClient.GET('/api/menu-items', {
        params: { query },
      })
      if (!data) throw new ApiError(response.status, error)
      return { items: data.data.items, meta: data.meta }
    },
    // Keep the current page visible while the next page or filter loads.
    placeholderData: keepPreviousData,
  })
}

function useInvalidateMenuItems() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: menuItemsQueryKey })
}

function useCreateMenuItem() {
  const invalidateMenuItems = useInvalidateMenuItems()

  return useMutation({
    mutationFn: async (body: CreateMenuItemBody) => {
      const { data, error, response } = await apiClient.POST(
        '/api/menu-items',
        { body },
      )
      if (!data) throw new ApiError(response.status, error)
      return data.data.menuItem
    },
    onSuccess: invalidateMenuItems,
  })
}

function useUpdateMenuItem() {
  const invalidateMenuItems = useInvalidateMenuItems()

  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: string
      body: UpdateMenuItemBody
    }) => {
      const { data, error, response } = await apiClient.PATCH(
        '/api/menu-items/{id}',
        { params: { path: { id } }, body },
      )
      if (!data) throw new ApiError(response.status, error)
      return data.data.menuItem
    },
    onSuccess: invalidateMenuItems,
  })
}

export function useDeleteMenuItem() {
  const invalidateMenuItems = useInvalidateMenuItems()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error, response } = await apiClient.DELETE(
        '/api/menu-items/{id}',
        { params: { path: { id } } },
      )
      if (!response.ok) throw new ApiError(response.status, error)
    },
    onSuccess: invalidateMenuItems,
  })
}

export function useRestoreMenuItem() {
  const invalidateMenuItems = useInvalidateMenuItems()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error, response } = await apiClient.POST(
        '/api/menu-items/{id}/restore',
        { params: { path: { id } } },
      )
      if (!data) throw new ApiError(response.status, error)
      return data.data.menuItem
    },
    onSuccess: invalidateMenuItems,
  })
}

// Bulk actions send explicit IDs and resolve with how many items actually changed.
export function useBulkDeleteMenuItems() {
  const invalidateMenuItems = useInvalidateMenuItems()

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { data, error, response } = await apiClient.POST(
        '/api/menu-items/bulk-delete',
        { body: { ids } },
      )
      if (!data) throw new ApiError(response.status, error)
      return data.data.updatedCount
    },
    onSuccess: invalidateMenuItems,
  })
}

export function useBulkRestoreMenuItems() {
  const invalidateMenuItems = useInvalidateMenuItems()

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { data, error, response } = await apiClient.POST(
        '/api/menu-items/bulk-restore',
        { body: { ids } },
      )
      if (!data) throw new ApiError(response.status, error)
      return data.data.updatedCount
    },
    onSuccess: invalidateMenuItems,
  })
}

type SaveMenuItemInput = {
  menuItem?: MenuItem | undefined
  body: CreateMenuItemBody
  // Key of an upload made in this form session that the database does not reference yet.
  pendingUploadKey: string | null
}

// Create or update, then remove local files only once the database no longer points at them.
export function useSaveMenuItem() {
  const createMenuItem = useCreateMenuItem()
  const updateMenuItem = useUpdateMenuItem()

  return async function saveMenuItem({
    menuItem,
    body,
    pendingUploadKey,
  }: SaveMenuItemInput) {
    const changes = menuItem ? getMenuItemChanges(menuItem, body) : null
    const { cleanupFailed } = await saveWithImageCleanup({
      previousKey: menuItem?.imageKey ?? null,
      pendingUploadKey,
      savedKey: body.imageKey ?? null,
      write: async () => {
        if (!menuItem) await createMenuItem.mutateAsync(body)
        else if (changes) {
          await updateMenuItem.mutateAsync({ id: menuItem.id, body: changes })
        }
      },
    })

    return { changed: !menuItem || Boolean(changes), cleanupFailed }
  }
}
