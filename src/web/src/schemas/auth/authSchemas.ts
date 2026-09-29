import { z } from 'zod'

// Mirrors the API credential rules so users see the same limits before submitting.
const emailSchema = z
  .string()
  .trim()
  .min(1, 'กรุณากรอกอีเมล')
  .pipe(z.email('รูปแบบอีเมลไม่ถูกต้อง'))

const passwordSchema = z
  .string()
  .trim()
  .min(1, 'กรุณากรอกรหัสผ่าน')
  .min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')

export const loginFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export const registerFormSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().trim().min(1, 'กรุณายืนยันรหัสผ่าน'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'รหัสผ่านทั้งสองช่องไม่ตรงกัน',
  })

export type AuthCredentials = z.output<typeof loginFormSchema>
export type LoginFormInput = z.input<typeof loginFormSchema>
export type RegisterFormInput = z.input<typeof registerFormSchema>
export type RegisterFormOutput = z.output<typeof registerFormSchema>
