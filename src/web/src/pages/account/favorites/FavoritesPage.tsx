import { HeartBreak, Prohibit, Storefront } from '@phosphor-icons/react'
import { useId, useRef, useState } from 'react'
import { Link } from 'react-router'

import { Button } from '@/components/Button'
import { FormAlert } from '@/components/FormAlert'
import { ImagePreview } from '@/components/ImagePreview'
import { PageShell } from '@/components/PageShell'
import { QueryListState } from '@/components/QueryListState'
import { useFavorites, useSetFavorite } from '@/hooks/favorites/useFavorites'
import { formatPrice } from '@/lib/formatPrice'
import type { FavoriteItem } from '@/schemas/favorites/favoriteSchemas'

const placeholderClassName =
  'flex h-20 w-20 shrink-0 items-center justify-center rounded-sm border-2 border-dashed border-line-soft text-center text-small text-muted'

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
              {items.map((favorite) => (
                <FavoriteRow
                  key={favorite.menuItemId}
                  favorite={favorite}
                  removing={
                    remove.isPending &&
                    remove.variables.menuItem.id === favorite.menuItemId
                  }
                  onRemove={() => removeFavorite(favorite)}
                />
              ))}
            </ul>
          )}
        </QueryListState>
      </section>
    </PageShell>
  )
}

function FavoriteRow({
  favorite,
  removing,
  onRemove,
}: {
  favorite: FavoriteItem
  removing: boolean
  onRemove: () => void
}) {
  const nameId = useId()
  const { menuItem, available } = favorite

  return (
    <li className="flex flex-col gap-3 rounded-sm border-2 border-paper bg-surface-raised p-3 shadow-sm sm:flex-row sm:items-center">
      <div className="flex flex-1 items-center gap-3">
        {menuItem.imageUrl ? (
          <ImagePreview
            url={menuItem.imageUrl}
            alt=""
            size="cell"
            fallback={
              <span className={placeholderClassName}>โหลดรูปไม่ได้</span>
            }
          />
        ) : (
          <span className={placeholderClassName}>ไม่มีรูป</span>
        )}
        <div className="flex min-w-0 flex-col gap-1">
          <p id={nameId} className="font-bold">
            {menuItem.name.th}
          </p>
          <p lang="en" className="text-small text-muted">
            {menuItem.name.en}
          </p>
          <p className="flex items-center gap-2 text-small">
            <Storefront aria-hidden size={18} weight="bold" />
            {menuItem.restaurant.name.th}
          </p>
          <p className="font-extrabold">{formatPrice(menuItem.price)}</p>
          {available ? null : (
            <p className="inline-flex items-center gap-1 self-start rounded-pill border-2 border-line-soft bg-canvas-soft px-2 text-small font-bold">
              <Prohibit aria-hidden size={16} weight="bold" />
              ไม่พร้อมให้บริการ
            </p>
          )}
        </div>
      </div>
      <Button
        variant="secondary"
        size="compact"
        aria-describedby={nameId}
        aria-busy={removing}
        disabled={removing}
        onClick={onRemove}
      >
        <HeartBreak aria-hidden weight="bold" />
        นำออกจากเมนูโปรด
      </Button>
    </li>
  )
}
