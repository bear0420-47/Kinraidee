import { screen, within } from '@testing-library/react'

export function dialog() {
  return within(screen.getByRole('dialog'))
}

// Text of the field's error message, found through its `aria-describedby` ids.
export function errorFor(field: HTMLElement) {
  const ids = field.getAttribute('aria-describedby')?.split(' ') ?? []
  const errorId = ids.find((id) => id.endsWith('-error'))
  return errorId ? document.getElementById(errorId)?.textContent : undefined
}
