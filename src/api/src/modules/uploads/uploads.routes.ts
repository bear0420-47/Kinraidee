import path from 'node:path'
import express, {
  Router,
  type RequestHandler,
  type Router as ExpressRouter,
} from 'express'

import { env } from '@/config/env'
import { requireAdmin } from '@/middleware/requireAdmin'
import { requireAuth } from '@/middleware/requireAuth'
import { uploadsController, type UploadsController } from './uploads.controller'
import {
  requireGeneratedUploadPath,
  requireLocalUploadsEnabled,
  uploadImageMiddleware,
} from './uploads.middleware'

type UploadRoutesDependencies = {
  controller?: UploadsController
  auth?: RequestHandler
  admin?: RequestHandler
  enabled?: RequestHandler
  multipart?: RequestHandler
}

export function createUploadsApiRoutes({
  controller = uploadsController,
  auth = requireAuth,
  admin = requireAdmin,
  enabled = requireLocalUploadsEnabled,
  multipart = uploadImageMiddleware,
}: UploadRoutesDependencies = {}): ExpressRouter {
  const router = Router()

  router.post(
    '/images',
    auth,
    admin,
    enabled,
    multipart,
    controller.uploadImage,
  )
  router.delete(
    '/images/:fileName',
    auth,
    admin,
    enabled,
    controller.deleteImage,
  )

  return router
}

export function createUploadsStaticRoutes(
  enabled = env.LOCAL_UPLOADS_ENABLED,
  rootDirectory = path.resolve(process.cwd(), env.LOCAL_UPLOADS_DIRECTORY),
): ExpressRouter {
  const router = Router()

  if (enabled) {
    router.use(requireGeneratedUploadPath)
    router.use(
      express.static(path.resolve(rootDirectory), {
        dotfiles: 'deny',
        fallthrough: true,
        index: false,
      }),
    )
  }

  return router
}

export const uploadsApiRoutes = createUploadsApiRoutes()
export const uploadsStaticRoutes = createUploadsStaticRoutes()
