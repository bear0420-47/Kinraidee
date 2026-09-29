import { describe, expect, it } from 'vitest'

import {
  buildAuthPath,
  getDefaultPathForRole,
  getPostLoginPath,
  getSafeReturnTo,
} from './authRedirects'

describe('getSafeReturnTo', () => {
  it.each([
    ['/', '/'],
    ['/account', '/account'],
    ['/admin/zones?page=2#top', '/admin/zones?page=2#top'],
    ['/meal/../account', '/account'],
  ])('accepts internal path %s', (value, expected) => {
    expect(getSafeReturnTo(value)).toBe(expected)
  })

  it.each([
    null,
    undefined,
    '',
    'account',
    'https://evil.example/admin',
    'javascript:alert(1)',
    '//evil.example',
    '/\\evil.example',
    '/\n//evil.example',
    '/login',
    '/login?returnTo=/admin',
    '/register',
  ])('rejects %j', (value) => {
    expect(getSafeReturnTo(value)).toBeNull()
  })
})

describe('post-login routing', () => {
  it('falls back by role when returnTo is missing or unsafe', () => {
    expect(getDefaultPathForRole('ADMIN')).toBe('/admin')
    expect(getDefaultPathForRole('USER')).toBe('/account')
    expect(getPostLoginPath(null, 'ADMIN')).toBe('/admin')
    expect(getPostLoginPath('//evil.example', 'USER')).toBe('/account')
  })

  it('uses a safe returnTo regardless of role', () => {
    expect(getPostLoginPath('/', 'USER')).toBe('/')
    expect(getPostLoginPath('/admin/zones', 'ADMIN')).toBe('/admin/zones')
  })
})

describe('buildAuthPath', () => {
  it('encodes a safe returnTo and drops an unsafe one', () => {
    expect(buildAuthPath('/login', '/admin/zones?x=1')).toBe(
      '/login?returnTo=%2Fadmin%2Fzones%3Fx%3D1',
    )
    expect(buildAuthPath('/register', 'https://evil.example')).toBe('/register')
    expect(buildAuthPath('/login', null)).toBe('/login')
  })
})
