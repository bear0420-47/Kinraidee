import { Outlet } from 'react-router'

import { SiteHeader } from '@/components/SiteHeader'

export function App() {
  return (
    <div className="min-h-screen bg-canvas">
      <SiteHeader />
      <main className="px-5 py-8 sm:py-10">
        <Outlet />
      </main>
    </div>
  )
}
