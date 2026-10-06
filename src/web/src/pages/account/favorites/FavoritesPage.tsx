import { HeartBreak } from '@phosphor-icons/react'
import { useRef, useState } from 'react'
import { Link } from 'react-router'

import { Button } from '@/components/Button'
import { FormAlert } from '@/components/FormAlert'
import { MenuSummaryRow } from '@/components/MenuSummaryRow'
import { PageShell } from '@/components/PageShell'
import { QueryListState } from '@/components/QueryListState'
import { useFavorites, useSetFavorite } from '@/hooks/favorites/useFavorites'
import type { FavoriteItem } from '@/schemas/favorites/favoriteSchemas'

// The signed-in user's saved menus, newest first. A deleted menu, or one whose Restaurant is
// deleted, stays listed as unavailable so it can still be removed.
export function FavoritesPage() {
  const favorites = useFavorites()
  const remove = useSetFavorite()
  // Stays mounted when the last row goes and the empty state replaces the list.
  const areaRef = useRef<HTMLElement>(null)
  const [removedName, setRemovedName] = useState('')

  function removeFavorite(favorite: FavoriteItem) {
    setRemovedName('')
    remove.mutate(
      { menuItem: favorite.menuItem, favorited: false },
      {
        // The removed row's button is gone, so focus moves to the favorites area.
        onSuccess: () => {
          setRemovedName(favorite.menuItem.name.th)
          areaRef.current?.focus()
        },
      },
    )
  }

  return (
    <PageShell
      title="เมนูโปรด"
      description="เมนูที่คุณบันทึกไว้ เรียงจากล่าสุด"
      width="medium"
    >
      <Link to="/account" className="self-start rounded-xs font-bold underline">
        กลับไปบัญชีของฉัน
      </Link>
      {remove.isError ? (
        <FormAlert
          key={remove.submittedAt}
          message="นำเมนูออกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"
        />
      ) : null}
      <p role="status" className="sr-only">
        {removedName ? `นำ${removedName}ออกจากเมนูโปรดแล้ว` : ''}
      </p>
      <section
        ref={areaRef}
        tabIndex={-1}
        aria-label="เมนูโปรดที่บันทึกไว้"
        className="rounded-sm"
      >
        <QueryListState
          query={favorites}
          items={favorites.data}
          loadingMessage="กำลังโหลดเมนูโปรด…"
          errorMessage="โหลดเมนูโปรดไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"
          emptyMessage="ยังไม่มีเมนูโปรด กดรูปหัวใจบนการ์ดเมนูเพื่อบันทึก"
        >
          {(items) => (
            <ul aria-label="รายการเมนูโปรด" className="flex flex-col gap-3">
              {items.map((favorite) => {
                const removing =
                  remove.isPending &&
                  remove.variables.menuItem.id === favorite.menuItemId
                return (
                  <MenuSummaryRow
                    key={favorite.menuItemId}
                    menuItem={favorite.menuItem}
                    available={favorite.available}
                    action={(nameId) => (
                      <Button
                        variant="secondary"
                        size="compact"
                        aria-describedby={nameId}
                        aria-busy={removing}
                        disabled={removing}
                        onClick={() => removeFavorite(favorite)}
                      >
                        <HeartBreak aria-hidden weight="bold" />
                        นำออกจากเมนูโปรด
                      </Button>
                    )}
                  />
                )
              })}
            </ul>
          )}
        </QueryListState>
      </section>
    </PageShell>
  )
}
