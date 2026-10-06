import { Router, type Router as ExpressRouter } from 'express'
import { auditLogsRoutes } from '@/modules/audit-logs/audit-logs.routes'
import { authRoutes } from '@/modules/auth/auth.routes'
import { favoritesRoutes } from '@/modules/favorites/favorites.routes'
import { foodTypesRoutes } from '@/modules/food-types/food-types.routes'
import { menuItemsRoutes } from '@/modules/menu-items/menu-items.routes'
import { recommendationsRoutes } from '@/modules/recommendations/recommendations.routes'
import { restaurantsRoutes } from '@/modules/restaurants/restaurants.routes'
import { tastesRoutes } from '@/modules/tastes/tastes.routes'
import {
  uploadsApiRoutes,
  uploadsStaticRoutes,
} from '@/modules/uploads/uploads.routes'
import { zonesRoutes } from '@/modules/zones/zones.routes'

export const routes: ExpressRouter = Router()

routes.use('/api/auth', authRoutes)
routes.use('/api/uploads', uploadsApiRoutes)
routes.use('/uploads', uploadsStaticRoutes)
routes.use('/api/zones', zonesRoutes)
routes.use('/api/food-types', foodTypesRoutes)
routes.use('/api/tastes', tastesRoutes)
routes.use('/api/restaurants', restaurantsRoutes)
routes.use('/api/menu-items', menuItemsRoutes)
routes.use('/api/recommendations', recommendationsRoutes)
routes.use('/api/favorites', favoritesRoutes)
routes.use('/api/audit-logs', auditLogsRoutes)
