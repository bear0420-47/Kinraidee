import { describe, expect, it } from 'vitest'

// Application source only; tests may render icons to compare their markup.
const sources = import.meta.glob<string>(
  [
    '/src/**/*.{ts,tsx}',
    '!/src/**/*.test.{ts,tsx}',
    '!/src/api/openapiTypes.ts',
  ],
  { query: '?raw', import: 'default', eager: true },
)

describe('icon policy', () => {
  it('scans the application source', () => {
    expect(Object.keys(sources)).toContain('/src/lib/foodTypeIcons.tsx')
  })

  it('contains no handwritten SVG markup', () => {
    const withSvg = Object.entries(sources)
      .filter(([, source]) => /<(svg|path|symbol|use)\b/.test(source))
      .map(([file]) => file)
    expect(withSvg).toEqual([])
  })

  it('imports Phosphor icons by name, never the whole namespace', () => {
    const namespaceImports = Object.entries(sources)
      .filter(([, source]) =>
        /import\s+\*\s+as\s+\w+\s+from\s+['"]@phosphor-icons/.test(source),
      )
      .map(([file]) => file)
    expect(namespaceImports).toEqual([])
  })
})
