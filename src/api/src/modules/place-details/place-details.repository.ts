import { prisma } from '@/lib/prisma'

export const placeDetailsRepository = {
  findRestaurant(id: string) {
    return prisma.restaurant.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, googlePlaceId: true },
    })
  },
}

export type PlaceDetailsRepository = typeof placeDetailsRepository
