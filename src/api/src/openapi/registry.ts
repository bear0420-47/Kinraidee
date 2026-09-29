import './setup.js'
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import { registerAuthOpenApi } from '@/modules/auth/auth.openapi'

export const registry = new OpenAPIRegistry()

registerAuthOpenApi(registry)
