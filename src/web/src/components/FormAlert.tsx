import { useEffect, useRef } from 'react'

export function FormAlert({ message }: { message: string }) {
  const alertRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    alertRef.current?.focus()
  }, [])

  return (
    <div
      ref={alertRef}
      role="alert"
      tabIndex={-1}
      className="rounded-sm border-2 border-rust bg-peach-deep p-3 font-bold text-rust"
    >
      {message}
    </div>
  )
}
