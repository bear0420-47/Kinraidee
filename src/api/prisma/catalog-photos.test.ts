import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  applySelection,
  cardImageUrl,
  reportDownloads,
  reviewPage,
  searchPhotos,
  toCandidates,
  type Candidate,
} from './catalog-photos'

const unsplashResponse = {
  results: [
    {
      id: 'abc123',
      alt_description: 'Spaghetti carbonara',
      urls: {
        raw: 'https://images.unsplash.com/photo-1?ixid=track',
        small: 'https://images.unsplash.com/photo-1?ixid=track&w=400',
      },
      links: {
        html: 'https://unsplash.com/photos/abc123',
        download_location:
          'https://api.unsplash.com/photos/abc123/download?ixid=track',
      },
      user: { name: 'Ana', links: { html: 'https://unsplash.com/@ana' } },
    },
  ],
}

const candidate = (id: number): Candidate => ({
  unsplashId: `id${id}`,
  url: `https://images.unsplash.com/photo-${id}?w=800`,
  thumbnail: `https://images.unsplash.com/photo-${id}?w=400`,
  photographer: `P${id}`,
  photographerUrl: `https://unsplash.com/@p${id}`,
  pageUrl: `https://unsplash.com/photos/id${id}`,
  downloadLocation: `https://api.unsplash.com/photos/id${id}/download`,
  alt: '',
})

describe('Unsplash mapping', () => {
  it('maps a search response to hotlinked card images with referral credit links', () => {
    expect(toCandidates(unsplashResponse)).toEqual([
      {
        unsplashId: 'abc123',
        url: 'https://images.unsplash.com/photo-1?ixid=track&w=800&q=75&fit=crop&auto=format',
        thumbnail: 'https://images.unsplash.com/photo-1?ixid=track&w=400',
        photographer: 'Ana',
        photographerUrl:
          'https://unsplash.com/@ana?utm_source=kinraidee&utm_medium=referral',
        pageUrl:
          'https://unsplash.com/photos/abc123?utm_source=kinraidee&utm_medium=referral',
        downloadLocation:
          'https://api.unsplash.com/photos/abc123/download?ixid=track',
        alt: 'Spaghetti carbonara',
      },
    ])
  })

  it('keeps the tracking value and sets a card size', () => {
    expect(
      cardImageUrl('https://images.unsplash.com/photo-1?ixid=x&w=4000'),
    ).toBe(
      'https://images.unsplash.com/photo-1?ixid=x&w=800&q=75&fit=crop&auto=format',
    )
  })
})

describe('searchPhotos', () => {
  let cacheDirectory = ''
  beforeEach(async () => {
    cacheDirectory = await mkdtemp(path.join(tmpdir(), 'kinraidee-photos-'))
  })
  afterEach(() => rm(cacheDirectory, { recursive: true, force: true }))

  const fakeFetch = () =>
    vi.fn(async (_url: URL | string, _init?: RequestInit) =>
      Response.json(unsplashResponse),
    )

  it('searches only keys without a pool, with the access key header', async () => {
    const fetchImpl = fakeFetch()
    const { results, remaining } = await searchPhotos({
      queries: { carbonara: 'spaghetti carbonara', 'has-pool': 'skip me' },
      pools: { 'has-pool': { query: 'skip me', photos: [] } },
      accessKey: 'test-key',
      fetchImpl: fetchImpl as unknown as typeof fetch,
      cacheDirectory,
      log: () => {},
    })

    expect(Object.keys(results)).toEqual(['carbonara'])
    expect(remaining).toBe(0)
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    const [url, init] = fetchImpl.mock.calls[0]!
    expect(new URL(url).searchParams.get('query')).toBe('spaghetti carbonara')
    expect(init?.headers).toEqual({ Authorization: 'Client-ID test-key' })
  })

  it('reuses cached results instead of searching again', async () => {
    const fetchImpl = fakeFetch()
    const options = {
      queries: { carbonara: 'spaghetti carbonara' },
      pools: {},
      accessKey: 'k',
      fetchImpl: fetchImpl as unknown as typeof fetch,
      cacheDirectory,
      log: () => {},
    }
    await searchPhotos(options)
    await searchPhotos(options)
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('stops at the hourly limit and reports what is left', async () => {
    const fetchImpl = fakeFetch()
    const queries = Object.fromEntries(
      Array.from({ length: 50 }, (_, index) => [
        `dish-${index}`,
        `dish ${index}`,
      ]),
    )
    const { remaining } = await searchPhotos({
      queries,
      pools: {},
      accessKey: 'k',
      fetchImpl: fetchImpl as unknown as typeof fetch,
      cacheDirectory,
      log: () => {},
    })
    expect(fetchImpl).toHaveBeenCalledTimes(48)
    expect(remaining).toBe(2)
  })

  it('stops with the HTTP status when Unsplash refuses', async () => {
    await expect(
      searchPhotos({
        queries: { refused: 'refused query' },
        pools: {},
        accessKey: 'bad',
        fetchImpl: (async () =>
          new Response('', { status: 401 })) as unknown as typeof fetch,
        cacheDirectory,
        log: () => {},
      }),
    ).rejects.toThrow('HTTP 401')
  })
})

describe('applySelection', () => {
  it('records picks with credit, keeps an empty pick as no match, and lists photos to report', () => {
    const { pools, chosen } = applySelection(
      {},
      {
        carbonara: { query: 'spaghetti carbonara', ids: ['id2', 'id1'] },
        'pickled-greens': { query: 'pickled greens', ids: [] },
      },
      { carbonara: [candidate(1), candidate(2)], 'pickled-greens': [] },
    )
    expect(pools.carbonara!.photos.map(({ unsplashId }) => unsplashId)).toEqual(
      ['id2', 'id1'],
    )
    expect(pools.carbonara!.photos[0]).toMatchObject({
      photographer: 'P2',
      url: candidate(2).url,
    })
    expect(pools['pickled-greens']).toEqual({
      query: 'pickled greens',
      photos: [],
    })
    expect(chosen.map(({ unsplashId }) => unsplashId)).toEqual(['id2', 'id1'])
  })

  it('rejects a photo that was not among the search results', () => {
    expect(() =>
      applySelection(
        {},
        { carbonara: { query: 'q', ids: ['id9'] } },
        { carbonara: [] },
      ),
    ).toThrow('carbonara: photo id9 is not among its search results.')
  })

  it('rejects more than five photos for a dish', () => {
    expect(() =>
      applySelection(
        {},
        {
          carbonara: {
            query: 'q',
            ids: [1, 2, 3, 4, 5, 6].map((id) => `id${id}`),
          },
        },
        { carbonara: [1, 2, 3, 4, 5, 6].map(candidate) },
      ),
    ).toThrow()
  })
})

describe('reportDownloads', () => {
  it('calls each chosen photo’s download endpoint with the access key', async () => {
    const fetchImpl = vi.fn(async (_url: string, _init?: RequestInit) =>
      Response.json({ url: 'x' }),
    )
    await reportDownloads(
      [candidate(1), candidate(2)],
      'k',
      fetchImpl as unknown as typeof fetch,
    )
    expect(fetchImpl.mock.calls.map(([url]) => url)).toEqual([
      candidate(1).downloadLocation,
      candidate(2).downloadLocation,
    ])
  })
})

describe('reviewPage', () => {
  it('escapes text and pre-ticks suggested photos', () => {
    const html = reviewPage(
      {
        carbonara: {
          query: 'a "carbonara"',
          candidates: [candidate(1), candidate(2)],
        },
      },
      { carbonara: ['คาโบนาร่า / Carbonara <b>'] },
      { carbonara: ['id2'] },
    )
    expect(html).toContain('a &#34;carbonara&#34;')
    expect(html).toContain('Carbonara &#60;b&#62;')
    expect(html).toContain('value="id2" checked')
    expect(html).not.toContain('value="id1" checked')
  })
})
