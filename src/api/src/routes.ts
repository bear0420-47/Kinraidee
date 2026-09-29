import { Router, type Router as ExpressRouter } from 'express'
import { authRoutes } from '@/modules/auth/auth.routes'
import { foodTypesRoutes } from '@/modules/food-types/food-types.routes'
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
