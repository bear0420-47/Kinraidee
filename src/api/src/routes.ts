import { Router, type Router as ExpressRouter } from 'express'
import { authRoutes } from '@/modules/auth/auth.routes'

export const routes: ExpressRouter = Router()

routes.use('/api/auth', authRoutes)
