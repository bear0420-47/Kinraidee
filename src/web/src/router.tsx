import { createBrowserRouter, Navigate, type RouteObject } from 'react-router'

import { App } from '@/App'
import { RedirectIfAuthenticated } from '@/components/RedirectIfAuthenticated'
import { RequireAuth } from '@/components/RequireAuth'
import { AccountPage } from '@/pages/account/AccountPage'
import { AdminPage } from '@/pages/admin/AdminPage'
import { FoodTypesPage } from '@/pages/admin/food-types/FoodTypesPage'
import { TastesPage } from '@/pages/admin/tastes/TastesPage'
import { ZonesPage } from '@/pages/admin/zones/ZonesPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { HomePage } from '@/pages/home/HomePage'

// Unbuilt account/admin child pages fall back to their landing page until
// their own issues add routes; the guard still protects every child path.
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
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
          { path: '*', element: <Navigate replace to="/account" /> },
        ],
      },
      {
        path: 'admin',
        element: <RequireAuth role="ADMIN" />,
        children: [
          { index: true, element: <AdminPage /> },
          { path: 'zones', element: <ZonesPage /> },
          { path: 'food-types', element: <FoodTypesPage /> },
          { path: 'tastes', element: <TastesPage /> },
          { path: '*', element: <Navigate replace to="/admin" /> },
        ],
      },
    ],
  },
]

export const router = createBrowserRouter(routes)
