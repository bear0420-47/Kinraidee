import { Button } from '@/components/Button'
import { FormAlert } from '@/components/FormAlert'
import { useLogout } from '@/hooks/auth/useLogout'

export function LogoutButton() {
  const logout = useLogout()

  return (
    <div className="flex flex-col gap-3">
      {logout.isError ? (
        <FormAlert
          key={logout.submittedAt}
          message="ออกจากระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"
        />
      ) : null}
      <Button
        variant="secondary"
        disabled={logout.isPending}
        onClick={() => logout.mutate()}
      >
        {logout.isPending ? 'กำลังออกจากระบบ…' : 'ออกจากระบบ'}
      </Button>
    </div>
  )
}
