import { describe, expect, it } from 'vitest'

import { loginFormSchema, registerFormSchema } from './authSchemas'

// Same rule as the form resolver: the first issue per field is what users see.
function firstMessages(result: ReturnType<typeof loginFormSchema.safeParse>) {
  const messages: Record<string, string> = {}
  for (const issue of result.error?.issues ?? []) {
    messages[String(issue.path[0])] ??= issue.message
  }
  return messages
}

describe('loginFormSchema', () => {
  it('trims email and password', () => {
    expect(
      loginFormSchema.parse({ email: ' a@b.co ', password: ' 12345678 ' }),
    ).toEqual({ email: 'a@b.co', password: '12345678' })
  })

  it('requires both fields', () => {
    expect(
      firstMessages(loginFormSchema.safeParse({ email: ' ', password: '' })),
    ).toEqual({ email: 'กรุณากรอกอีเมล', password: 'กรุณากรอกรหัสผ่าน' })
  })

  it('rejects malformed email and passwords shorter than 8 after trimming', () => {
    expect(
      firstMessages(
        loginFormSchema.safeParse({
          email: 'not-an-email',
          password: ' 1234567 ',
        }),
      ),
    ).toEqual({
      email: 'รูปแบบอีเมลไม่ถูกต้อง',
      password: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร',
    })
  })

  it('accepts exactly 8 characters', () => {
    expect(
      loginFormSchema.safeParse({ email: 'a@b.co', password: '12345678' })
        .success,
    ).toBe(true)
  })
})

describe('registerFormSchema', () => {
  it('requires matching confirmation after trimming', () => {
    expect(
      registerFormSchema.safeParse({
        email: 'a@b.co',
        password: ' password1 ',
        confirmPassword: 'password1',
      }).success,
    ).toBe(true)

    const mismatch = registerFormSchema.safeParse({
      email: 'a@b.co',
      password: 'password1',
      confirmPassword: 'password2',
    })
    expect(mismatch.success).toBe(false)
    expect(mismatch.error?.issues[0]).toMatchObject({
      path: ['confirmPassword'],
      message: 'รหัสผ่านทั้งสองช่องไม่ตรงกัน',
    })
  })
})
