import { describe, expect, it } from 'vitest'

import { readFilters, writeFilters } from './urlFilters'

const defaults = { page: 1, search: '', zoneId: '', includeDeleted: false }

describe('readFilters', () => {
  it('returns the defaults for an empty query', () => {
    expect(readFilters(new URLSearchParams(), defaults)).toEqual(defaults)
  })

  it('reads each value with its default type', () => {
    expect(
      readFilters(
        new URLSearchParams('page=3&search=ข้าว&zoneId=z1&includeDeleted=true'),
        defaults,
      ),
    ).toEqual({ page: 3, search: 'ข้าว', zoneId: 'z1', includeDeleted: true })
  })

  it('falls back to the default for an unreadable page', () => {
    for (const page of ['0', '-2', '1.5', 'abc', '']) {
      expect(readFilters(new URLSearchParams({ page }), defaults).page).toBe(1)
    }
  })

  it('treats any boolean value other than true as false', () => {
    expect(
      readFilters(new URLSearchParams('includeDeleted=yes'), defaults)
        .includeDeleted,
    ).toBe(false)
  })

  it('ignores keys that are not filters', () => {
    expect(readFilters(new URLSearchParams('other=1'), defaults)).toEqual(
      defaults,
    )
  })
})

describe('writeFilters', () => {
  it('leaves defaults out of the URL', () => {
    expect(
      writeFilters(new URLSearchParams(), defaults, defaults).toString(),
    ).toBe('')
  })

  it('writes changed values and removes values reset to their default', () => {
    const params = writeFilters(
      new URLSearchParams('search=old&page=4'),
      { ...defaults, search: 'ข้าว', includeDeleted: true },
      defaults,
    )

    expect(params.get('search')).toBe('ข้าว')
    expect(params.get('includeDeleted')).toBe('true')
    expect(params.has('page')).toBe(false)
  })

  it('keeps keys that are not filters', () => {
    expect(
      writeFilters(new URLSearchParams('other=1'), defaults, defaults).get(
        'other',
      ),
    ).toBe('1')
  })

  it('round-trips through readFilters', () => {
    const filters = {
      page: 2,
      search: 'a b',
      zoneId: 'z1',
      includeDeleted: true,
    }
    expect(
      readFilters(
        writeFilters(new URLSearchParams(), filters, defaults),
        defaults,
      ),
    ).toEqual(filters)
  })
})
