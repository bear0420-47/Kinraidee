import './setup.js'
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import { registerAuthOpenApi } from '@/modules/auth/auth.openapi'
import { registerFoodTypesOpenApi } from '@/modules/food-types/food-types.openapi'
import { registerUploadsOpenApi } from '@/modules/uploads/uploads.openapi'
import { registerZonesOpenApi } from '@/modules/zones/zones.openapi'

export const registry = new OpenAPIRegistry()

registerAuthOpenApi(registry)
registerUploadsOpenApi(registry)
registerZonesOpenApi(registry)
registerFoodTypesOpenApi(registry)
