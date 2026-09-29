import './setup.js'
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import { registerAuthOpenApi } from '@/modules/auth/auth.openapi'
import { registerUploadsOpenApi } from '@/modules/uploads/uploads.openapi'

export const registry = new OpenAPIRegistry()

registerAuthOpenApi(registry)
registerUploadsOpenApi(registry)
