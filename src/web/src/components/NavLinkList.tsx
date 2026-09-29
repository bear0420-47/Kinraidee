import { Link } from 'react-router'

type NavLinkListProps = {
  label: string
  links: { to: string; label: string }[]
}

export function NavLinkList({ label, links }: NavLinkListProps) {
  return (
    <nav aria-label={label}>
      <ul className="flex flex-col gap-3">
        {links.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              className="flex min-h-12 items-center rounded-sm border-2 border-paper bg-surface-raised px-4 font-bold shadow-sm hover:bg-peach-deep"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
