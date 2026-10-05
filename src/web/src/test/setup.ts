import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// openapi-fetch captures fetch when the client module loads, so stub it first.
globalThis.fetch = vi.fn<typeof fetch>()

// jsdom's FormData/File/Blob cannot be sent through Node's Request (multipart uploads),
// so tests use Node's implementations, as a browser uses its native ones. Node's FormData
// is extended so `new FormData(form)` still reads a jsdom form's fields.
const DomFormData = globalThis.FormData
const NodeFormData = (await new Response(new URLSearchParams()).formData())
  .constructor as typeof FormData
// Node built-in; the web project has no Node types, so only these two classes are typed.
const { Blob: NodeBlob, File: NodeFile } = (await import(
  /* @vite-ignore */ 'node:buffer' as string
)) as { Blob: typeof Blob; File: typeof File }

class TestFormData extends NodeFormData {
  constructor(form?: HTMLFormElement) {
    super()
    if (!form) return
    for (const [name, value] of new DomFormData(form)) this.append(name, value)
  }
}

globalThis.FormData = TestFormData
globalThis.Blob = NodeBlob
globalThis.File = NodeFile

// jsdom has no layout or media queries. Tests can override the stubs to check scrolling
// and reduced motion.
Element.prototype.scrollIntoView = vi.fn()
window.matchMedia = vi.fn((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  addListener: vi.fn(),
  removeListener: vi.fn(),
  dispatchEvent: vi.fn(() => false),
}))

afterEach(() => {
  cleanup()
  vi.mocked(fetch).mockReset()
  localStorage.clear()
  sessionStorage.clear()
})
