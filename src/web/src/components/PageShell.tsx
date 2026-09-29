import type { ReactNode } from 'react'

type PageShellProps = {
  title: string
  description?: string
  children: ReactNode
}

export function PageShell({ title, description, children }: PageShellProps) {
  return (
    <section className="mx-auto flex w-full max-w-md flex-col gap-5 rounded-lg border-2 border-paper bg-surface p-6 shadow-lg">
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
