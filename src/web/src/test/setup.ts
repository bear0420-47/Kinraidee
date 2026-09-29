import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// openapi-fetch captures fetch when the client module loads, so stub it first.
globalThis.fetch = vi.fn<typeof fetch>()

afterEach(() => {
  cleanup()
  vi.mocked(fetch).mockReset()
  localStorage.clear()
  sessionStorage.clear()
})
