import { useEffect, type ReactNode } from 'react'

// Marks the document as the admin area while an admin route is shown, so styles.css can
// switch headings to the body font. It is set on <html> so portaled dialogs follow it too.
export function AdminArea({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement
    root.dataset.area = 'admin'
    return () => {
      delete root.dataset.area
    }
  }, [])

  return children
}
