import './setup.js'
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import { registerAuditLogsOpenApi } from '@/modules/audit-logs/audit-logs.openapi'
import { registerAuthOpenApi } from '@/modules/auth/auth.openapi'
import { registerFoodTypesOpenApi } from '@/modules/food-types/food-types.openapi'
import { registerMenuItemsOpenApi } from '@/modules/menu-items/menu-items.openapi'
import { registerRecommendationsOpenApi } from '@/modules/recommendations/recommendations.openapi'
import { registerRestaurantsOpenApi } from '@/modules/restaurants/restaurants.openapi'
import { registerTastesOpenApi } from '@/modules/tastes/tastes.openapi'
import { registerUploadsOpenApi } from '@/modules/uploads/uploads.openapi'
import { registerZonesOpenApi } from '@/modules/zones/zones.openapi'

export const registry = new OpenAPIRegistry()

registerAuthOpenApi(registry)
registerUploadsOpenApi(registry)
registerZonesOpenApi(registry)
registerFoodTypesOpenApi(registry)
registerTastesOpenApi(registry)
registerRestaurantsOpenApi(registry)
registerMenuItemsOpenApi(registry)
registerRecommendationsOpenApi(registry)
registerAuditLogsOpenApi(registry)
