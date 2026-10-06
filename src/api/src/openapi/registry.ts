import './setup.js'
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import { registerAuditLogsOpenApi } from '@/modules/audit-logs/audit-logs.openapi'
import { registerAuthOpenApi } from '@/modules/auth/auth.openapi'
import { registerFavoritesOpenApi } from '@/modules/favorites/favorites.openapi'
import { registerFoodTypesOpenApi } from '@/modules/food-types/food-types.openapi'
import { registerMenuItemsOpenApi } from '@/modules/menu-items/menu-items.openapi'
import { registerPreferencesOpenApi } from '@/modules/preferences/preferences.openapi'
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
registerFavoritesOpenApi(registry)
registerPreferencesOpenApi(registry)
registerAuditLogsOpenApi(registry)
