import {
  useEffect,
  useId,
  useRef,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react'
import { createPortal } from 'react-dom'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function getFocusableElements(container: HTMLElement) {
  return [...container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)]
}

type DialogProps = {
  title: string
  onClose: () => void
  children: ReactNode
  // Receives focus on close when the opener no longer exists, e.g. a deleted row's button.
  fallbackFocusRef?: RefObject<HTMLElement | null>
  // `wide` fits content larger than a form, such as a full-size image.
  size?: 'default' | 'wide'
}

const sizeClassNames = {
  default: 'max-w-md',
  wide: 'max-w-3xl',
}

// Modal dialog: makes the page inert, traps Tab, closes on Escape, and returns focus.
export function Dialog({
  title,
  onClose,
  children,
  fallbackFocusRef,
  size = 'default',
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const opener =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    const background = [...document.body.children].filter(
      (element) => !element.contains(dialog) && !element.hasAttribute('inert'),
    )
    background.forEach((element) => element.setAttribute('inert', ''))
    ;(getFocusableElements(dialog)[0] ?? dialog).focus()

    return () => {
      background.forEach((element) => element.removeAttribute('inert'))
      const target = opener?.isConnected ? opener : fallbackFocusRef?.current
      target?.focus()
    }
    // Runs once per opening; the refs are read when the dialog closes.
  }, [])

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.stopPropagation()
      onClose()
      return
    }
    if (event.key !== 'Tab' || !dialogRef.current) return

    const focusable = getFocusableElements(dialogRef.current)
    const first = focusable[0]
    const last = focusable.at(-1)
    if (!first || !last) {
      event.preventDefault()
      return
    }

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-10 flex items-end justify-center bg-paper/40 p-4 sm:items-center">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={`flex max-h-[90vh] w-full ${sizeClassNames[size]} flex-col gap-4 overflow-y-auto rounded-dialog border-2 border-paper bg-glass p-6 shadow-lg`}
      >
        <h2 id={titleId} className="font-display text-card-title leading-tight">
          {title}
        </h2>
        {children}
      </div>
    </div>,
    document.body,
  )
}
