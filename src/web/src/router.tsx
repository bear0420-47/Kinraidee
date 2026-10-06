import { createBrowserRouter, Navigate, type RouteObject } from 'react-router'

import { App } from '@/App'
import { AdminArea } from '@/components/AdminArea'
import { RedirectIfAuthenticated } from '@/components/RedirectIfAuthenticated'
import { RequireAuth } from '@/components/RequireAuth'
import { AccountPage } from '@/pages/account/AccountPage'
import { FavoritesPage } from '@/pages/account/favorites/FavoritesPage'
import { HistoryPage } from '@/pages/account/history/HistoryPage'
import { PreferencesPage } from '@/pages/account/preferences/PreferencesPage'
import { AdminPage } from '@/pages/admin/AdminPage'
import { AuditLogsPage } from '@/pages/admin/audit-logs/AuditLogsPage'
import { FoodTypesPage } from '@/pages/admin/food-types/FoodTypesPage'
import { MenuItemsPage } from '@/pages/admin/menu-items/MenuItemsPage'
import { RestaurantsPage } from '@/pages/admin/restaurants/RestaurantsPage'
import { TastesPage } from '@/pages/admin/tastes/TastesPage'
import { ZonesPage } from '@/pages/admin/zones/ZonesPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { HomePage } from '@/pages/home/HomePage'
import { MealPage } from '@/pages/meal/MealPage'

// Unbuilt account/admin child pages fall back to their landing page until
// their own issues add routes; the guard still protects every child path.
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'meal', element: <MealPage /> },
      {
        element: <RedirectIfAuthenticated />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'register', element: <RegisterPage /> },
        ],
      },
      {
        path: 'account',
        element: <RequireAuth />,
        children: [
          { index: true, element: <AccountPage /> },
          { path: 'favorites', element: <FavoritesPage /> },
          { path: 'history', element: <HistoryPage /> },
          { path: 'preferences', element: <PreferencesPage /> },
          { path: '*', element: <Navigate replace to="/account" /> },
        ],
      },
      {
        path: 'admin',
        element: (
          <AdminArea>
            <RequireAuth role="ADMIN" />
          </AdminArea>
        ),
        children: [
          { index: true, element: <AdminPage /> },
          { path: 'zones', element: <ZonesPage /> },
          { path: 'food-types', element: <FoodTypesPage /> },
          { path: 'tastes', element: <TastesPage /> },
          { path: 'restaurants', element: <RestaurantsPage /> },
          { path: 'menu-items', element: <MenuItemsPage /> },
          { path: 'audit-logs', element: <AuditLogsPage /> },
          { path: '*', element: <Navigate replace to="/admin" /> },
        ],
      },
    ],
  },
]

export const router = createBrowserRouter(routes)
