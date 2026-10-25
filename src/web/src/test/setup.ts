import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// openapi-fetch captures fetch when the client module loads, so stub it first.
globalThis.fetch = vi.fn<typeof fetch>()

// Node 26 exposes an unavailable storage shim unless a file flag is supplied.
class MemoryStorage implements Storage {
  private readonly values: Map<string, string>
  constructor() {
    Object.defineProperty(this, 'values', {
      configurable: false,
      enumerable: false,
      value: new Map<string, string>(),
    })
    this.values = (this as unknown as { values: Map<string, string> }).values
  }
  get length() {
    return this.values.size
  }
  clear() {
    for (const key of this.values.keys())
      delete (this as Record<string, unknown>)[key]
    this.values.clear()
  }
  getItem(key: string) {
    return this.values.get(key) ?? null
  }
  key(index: number) {
    return [...this.values.keys()][index] ?? null
  }
  removeItem(key: string) {
    this.values.delete(key)
    delete (this as Record<string, unknown>)[key]
  }
  setItem(key: string, value: string) {
    this.values.set(key, String(value))
    Object.defineProperty(this, key, {
      configurable: true,
      enumerable: true,
      get: () => this.getItem(key),
    })
  }
}
for (const name of ['localStorage', 'sessionStorage'] as const) {
  const storage = new MemoryStorage()
  Object.defineProperty(globalThis, name, {
    configurable: true,
    value: storage,
  })
  Object.defineProperty(window, name, { configurable: true, value: storage })
}

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
