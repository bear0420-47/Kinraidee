import type { ReactNode } from 'react'

type PageShellProps = {
  // Omit when the page content supplies its own primary heading (for example, meal results).
  title?: string
  description?: string
  // `extra-wide` is for data-dense tables, such as the MenuItem list.
  width?: 'narrow' | 'medium' | 'wide' | 'extra-wide'
  appearance?: 'paper' | 'plain'
  children: ReactNode
}

const widthClassNames = {
  narrow: 'max-w-md',
  // Single-column flows with choice chips, such as the meal conditions.
  medium: 'max-w-2xl',
  wide: 'max-w-shell',
  'extra-wide': 'max-w-shell-wide',
}

export function PageShell({
  title,
  description,
  width = 'narrow',
  appearance = 'paper',
  children,
}: PageShellProps) {
  return (
    <section
      className={`mx-auto flex w-full ${widthClassNames[width]} flex-col gap-5 ${appearance === 'paper' ? 'rounded-lg border-2 border-paper bg-surface p-6 shadow-lg' : ''}`}
    >
      {title || description ? (
        <header className="flex flex-col gap-2">
          {title ? (
            <h1 className="pt-1 font-display text-section-mobile leading-snug sm:text-section">
              {title}
            </h1>
          ) : null}
          {description ? <p className="text-muted">{description}</p> : null}
        </header>
      ) : null}
      {children}
    </section>
  )
}
