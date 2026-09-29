import { Outlet } from 'react-router'

import { SiteHeader } from '@/components/SiteHeader'

export function App() {
  return (
    <div className="min-h-screen bg-canvas-soft">
      <SiteHeader />
      <main className="px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
