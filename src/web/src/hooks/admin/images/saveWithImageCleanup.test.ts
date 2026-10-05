import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ImageSaveError, saveWithImageCleanup } from './saveWithImageCleanup'
import { discardUploadedImage } from './useImageUpload'

vi.mock('./useImageUpload', () => ({ discardUploadedImage: vi.fn() }))

const discard = vi.mocked(discardUploadedImage)
const succeed = () => Promise.resolve()

beforeEach(() => {
  discard.mockReset()
  discard.mockResolvedValue(true)
})

describe('saveWithImageCleanup', () => {
  it('removes the replaced local image only after the write succeeds', async () => {
    const order: string[] = []
    discard.mockImplementation(async (key) => {
      order.push(`discard ${key}`)
      return true
    })

    const result = await saveWithImageCleanup({
      previousKey: 'old.webp',
      pendingUploadKey: 'new.webp',
      savedKey: 'new.webp',
      write: async () => {
        order.push('write')
      },
    })

    expect(order).toEqual(['write', 'discard old.webp'])
    expect(result).toEqual({ cleanupFailed: false })
  })

  it('removes an upload the saved record does not use', async () => {
    await saveWithImageCleanup({
      previousKey: null,
      pendingUploadKey: 'unused.webp',
      savedKey: null,
      write: succeed,
    })

    expect(discard.mock.calls).toEqual([['unused.webp']])
  })

  it('touches nothing when the image is unchanged or external', async () => {
    await saveWithImageCleanup({
      previousKey: 'same.webp',
      pendingUploadKey: null,
      savedKey: 'same.webp',
      write: succeed,
    })
    await saveWithImageCleanup({
      previousKey: null,
      pendingUploadKey: null,
      savedKey: null,
      write: succeed,
    })

    expect(discard).not.toHaveBeenCalled()
  })

  it('keeps the old image and removes only the new upload when the write fails', async () => {
    const reason = new Error('boom')

    const error = await saveWithImageCleanup({
      previousKey: 'old.webp',
      pendingUploadKey: 'new.webp',
      savedKey: 'new.webp',
      write: () => Promise.reject(reason),
    }).catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(ImageSaveError)
    expect(error).toMatchObject({
      reason,
      uploadDiscarded: true,
      cleanupFailed: false,
    })
    expect(discard.mock.calls).toEqual([['new.webp']])
  })

  it('reports a cleanup that could not remove the file', async () => {
    discard.mockResolvedValueOnce(false)

    const result = await saveWithImageCleanup({
      previousKey: 'old.webp',
      pendingUploadKey: null,
      savedKey: null,
      write: succeed,
    })

    expect(result).toEqual({ cleanupFailed: true })
  })
})
