import { Heart } from '@phosphor-icons/react'
import { useLocation, useNavigate } from 'react-router'

import { ApiError } from '@/api/apiError'
import { isUnauthenticated, useCurrentUser } from '@/hooks/auth/useCurrentUser'
import { useFavorites, useSetFavorite } from '@/hooks/favorites/useFavorites'
import { buildAuthPath, type LoginNotice } from '@/lib/authRedirects'
import type { FavoriteMenuItem } from '@/schemas/favorites/favoriteSchemas'

type FavoriteButtonProps = {
  menuItem: FavoriteMenuItem
  // Positions the button, such as over a photo's corner.
  className?: string
}

function errorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 409) {
    return 'เมนูนี้ไม่พร้อมให้บริการแล้ว'
  }
  return 'บันทึกเมนูโปรดไม่สำเร็จ ลองใหม่อีกครั้ง'
}

// Saves or removes a menu favorite. Signed out, it sends the user to log in and back to this
// page, without favoriting anything automatically. The state is carried by the heart's shape
// (outline or filled), the label, and `aria-pressed`, never by colour alone.
export function FavoriteButton({ menuItem, className }: FavoriteButtonProps) {
  const currentUser = useCurrentUser()
  const favorites = useFavorites()
  const setFavorite = useSetFavorite()
  const navigate = useNavigate()
  const location = useLocation()

  // Favorites are optional, so an unknown sign-in state hides the button instead of failing.
  if (currentUser.isError) return null

  const signedIn = Boolean(currentUser.data)
  const favorited =
    favorites.data?.some((item) => item.menuItemId === menuItem.id) ?? false
  const label = favorited ? 'นำออกจากเมนูโปรด' : 'บันทึกเป็นเมนูโปรด'
  const busy =
    currentUser.isPending ||
    (signedIn && favorites.isPending) ||
    setFavorite.isPending

  function goToLogin() {
    const notice: LoginNotice = 'FAVORITE_LOGIN'
    void navigate(
      buildAuthPath('/login', `${location.pathname}${location.search}`),
      { state: { notice } },
    )
  }

  function onClick() {
    if (!signedIn) {
      goToLogin()
      return
    }
    // An expired session is treated like signing out: log in, then press again.
    setFavorite.mutate(
      { menuItem, favorited: !favorited },
      {
        onError: (error) => {
          if (isUnauthenticated(error)) goToLogin()
        },
      },
    )
  }

  const failed =
    setFavorite.error && !isUnauthenticated(setFavorite.error)
      ? errorMessage(setFavorite.error)
      : null

  return (
    <div className={`flex flex-col items-end gap-1 ${className ?? ''}`}>
      <button
        type="button"
        aria-label={label}
        title={label}
        aria-pressed={signedIn ? favorited : undefined}
        aria-busy={setFavorite.isPending}
        disabled={busy}
        onClick={onClick}
        className={`flex h-11 w-11 items-center justify-center rounded-pill border-2 border-paper shadow-sm transition hover:bg-peach-deep disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none ${
          favorited ? 'bg-ice' : 'bg-surface'
        }`}
      >
        <Heart aria-hidden size={22} weight={favorited ? 'fill' : 'bold'} />
      </button>
      {failed ? (
        <p
          role="alert"
          className="rounded-sm border-2 border-paper bg-surface px-2 text-small font-bold text-rust"
        >
          {failed}
        </p>
      ) : null}
    </div>
  )
}
