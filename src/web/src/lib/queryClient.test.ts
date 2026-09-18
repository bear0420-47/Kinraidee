import { describe, expect, it } from 'vitest'
import { queryClient } from './queryClient'

describe('queryClient', () => {
  it('uses the scaffold default query options', () => {
    expect(queryClient.getDefaultOptions().queries?.staleTime).toBe(30_000)
    expect(queryClient.getDefaultOptions().queries?.retry).toBe(1)
  })
})
