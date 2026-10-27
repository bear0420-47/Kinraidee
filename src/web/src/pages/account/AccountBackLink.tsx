import { ArrowLeft } from '@phosphor-icons/react'
import { Link } from 'react-router'

export function AccountBackLink() {
  return (
    <Link
      to="/account"
      className="inline-flex min-h-11 items-center gap-2 self-start rounded-xs text-small font-bold underline sm:text-body"
    >
      <ArrowLeft aria-hidden weight="bold" />
      กลับไปบัญชีของฉัน
    </Link>
  )
}
