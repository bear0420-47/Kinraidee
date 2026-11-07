import { describe, expect, it } from 'vitest'

import { safeLinkUrl } from './safeLinkUrl'

describe('safeLinkUrl', () => {
  it.each([
    ['https://maps.google.com/?cid=1', 'https://maps.google.com/?cid=1'],
    ['http://example.com/a', 'http://example.com/a'],
  ])('keeps the http(s) link %s', (input, expected) => {
    expect(safeLinkUrl(input)).toBe(expected)
  })

  it.each([
    'javascript:alert(1)',
    ' JavaScript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)',
    'not a url',
    '',
    null,
    undefined,
  ])('drops the unsafe or empty value %s', (input) => {
    expect(safeLinkUrl(input)).toBeNull()
  })
})
