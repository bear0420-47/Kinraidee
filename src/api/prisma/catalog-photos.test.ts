import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  applySelection,
  cardImageUrl,
  reviewPage,
  searchPhotos,
  toCandidates,
  type Candidate,
} from './catalog-photos'

const pexelsResponse = {
  photos: [
    {
      id: 101,
      url: 'https://www.pexels.com/photo/carbonara-101/',
      photographer: 'Ana',
      photographer_url: 'https://www.pexels.com/@ana',
      alt: 'Spaghetti carbonara',
      src: {
        large:
          'https://images.pexels.com/photos/101/pexels-photo-101.jpeg?auto=compress&h=650&w=940',
        medium:
          'https://images.pexels.com/photos/101/pexels-photo-101.jpeg?h=350',
      },
    },
  ],
}

const candidate = (id: number): Candidate => ({
  pexelsId: id,
  url: `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?w=800`,
  thumbnail: `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?h=350`,
  photographer: `P${id}`,
  photographerUrl: `https://www.pexels.com/@p${id}`,
  pageUrl: `https://www.pexels.com/photo/${id}/`,
  alt: '',
})

describe('Pexels mapping', () => {
  it('maps a search response to card-sized CDN links with credit', () => {
    expect(toCandidates(pexelsResponse)).toEqual([
      {
        pexelsId: 101,
        url: 'https://images.pexels.com/photos/101/pexels-photo-101.jpeg?auto=compress&cs=tinysrgb&w=800',
        thumbnail:
          'https://images.pexels.com/photos/101/pexels-photo-101.jpeg?h=350',
        photographer: 'Ana',
        photographerUrl: 'https://www.pexels.com/@ana',
        pageUrl: 'https://www.pexels.com/photo/carbonara-101/',
        alt: 'Spaghetti carbonara',
      },
    ])
  })

  it('replaces any size parameters with an 800 px width', () => {
    expect(
      cardImageUrl('https://images.pexels.com/photos/1/a.jpeg?h=650&w=940'),
    ).toBe(
      'https://images.pexels.com/photos/1/a.jpeg?auto=compress&cs=tinysrgb&w=800',
    )
  })
})

describe('searchPhotos', () => {
  let cacheDirectory = ''
  beforeEach(async () => {
    cacheDirectory = await mkdtemp(path.join(tmpdir(), 'kinraidee-photos-'))
  })
  afterEach(() => rm(cacheDirectory, { recursive: true, force: true }))

  it('searches only keys without a pool, sending the key in the header', async () => {
    const fetchImpl = vi.fn(async () => Response.json(pexelsResponse))
    const results = await searchPhotos({
      queries: {
        'carbonara-test-only': 'spaghetti carbonara test',
        'has-pool': 'skip me',
      },
      pools: { 'has-pool': { query: 'skip me', photos: [] } },
      apiKey: 'test-key',
      fetchImpl: fetchImpl as unknown as typeof fetch,
      log: () => {},
      cacheDirectory,
    })

    expect(Object.keys(results)).toEqual(['carbonara-test-only'])
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [URL, RequestInit]
    expect(url.searchParams.get('query')).toBe('spaghetti carbonara test')
    expect(init.headers).toEqual({ Authorization: 'test-key' })
  })

  it('stops with the HTTP status when Pexels refuses', async () => {
    await expect(
      searchPhotos({
        queries: { 'refused-test-only': 'refused query' },
        pools: {},
        apiKey: 'bad',
        fetchImpl: (async () =>
          new Response('', { status: 401 })) as typeof fetch,
        log: () => {},
        cacheDirectory,
      }),
    ).rejects.toThrow('HTTP 401')
  })
})

describe('applySelection', () => {
  it('writes the picked photos with their credit and keeps an empty pick as no match', () => {
    const pools = applySelection(
      {},
      {
        carbonara: { query: 'spaghetti carbonara', ids: [2, 1] },
        'pickled-greens': { query: 'pickled greens', ids: [] },
      },
      { carbonara: [candidate(1), candidate(2)], 'pickled-greens': [] },
    )
    expect(pools.carbonara!.photos.map(({ pexelsId }) => pexelsId)).toEqual([
      2, 1,
    ])
    expect(pools.carbonara!.photos[0]).toMatchObject({
      photographer: 'P2',
      url: candidate(2).url,
    })
    expect(pools['pickled-greens']).toEqual({
      query: 'pickled greens',
      photos: [],
    })
  })

  it('rejects a photo that was not among the search results', () => {
    expect(() =>
      applySelection(
        {},
        { carbonara: { query: 'q', ids: [9] } },
        { carbonara: [] },
      ),
    ).toThrow('carbonara: photo 9 is not among its search results.')
  })

  it('rejects more than five photos for a dish', () => {
    expect(() =>
      applySelection(
        {},
        { carbonara: { query: 'q', ids: [1, 2, 3, 4, 5, 6] } },
        { carbonara: [1, 2, 3, 4, 5, 6].map(candidate) },
      ),
    ).toThrow()
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
      { carbonara: [2] },
    )
    expect(html).toContain('a &#34;carbonara&#34;')
    expect(html).toContain('Carbonara &#60;b&#62;')
    expect(html).toContain('value="2" checked')
    expect(html).not.toContain('value="1" checked')
  })
})
