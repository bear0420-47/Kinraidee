import { Prisma, UserRole } from '@prisma/client'

import { prisma } from '@/lib/prisma'

export class DuplicateEmailError extends Error {
  constructor() {
    super('Duplicate email')
    this.name = 'DuplicateEmailError'
  }
}

export const authRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } })
  },

  findById(id: string) {
    return prisma.user.findUnique({ where: { id } })
  },

  async createUser(email: string, password: string) {
    try {
      return await prisma.user.create({
        data: { email, password, role: UserRole.USER },
      })
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new DuplicateEmailError()
      }

      throw error
    }
  },
}

export type AuthRepository = typeof authRepository
