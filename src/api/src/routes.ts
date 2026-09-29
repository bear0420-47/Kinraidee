import { Router, type Router as ExpressRouter } from 'express'
import { authRoutes } from '@/modules/auth/auth.routes'
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
