import type { ReactNode } from 'react'

type PageShellProps = {
  title: string
  description?: string
  width?: 'narrow' | 'wide'
  children: ReactNode
}

const widthClassNames = {
  narrow: 'max-w-md',
  wide: 'max-w-shell',
}

export function PageShell({
  title,
  description,
  width = 'narrow',
  children,
}: PageShellProps) {
  return (
    <section
      className={`mx-auto flex w-full ${widthClassNames[width]} flex-col gap-5 rounded-lg border-2 border-paper bg-surface p-6 shadow-lg`}
    >
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-section-mobile leading-tight sm:text-section">
          {title}
        </h1>
        {description ? <p className="text-muted">{description}</p> : null}
      </header>
      {children}
    </section>
  )
}
