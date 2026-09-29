import { LogoutButton } from '@/components/LogoutButton'
import { NavLinkList } from '@/components/NavLinkList'
import { PageShell } from '@/components/PageShell'

const adminLinks = [
  { to: '/admin/zones', label: 'โซน' },
  { to: '/admin/food-types', label: 'ประเภทอาหาร' },
  { to: '/admin/tastes', label: 'รสชาติ' },
  { to: '/admin/restaurants', label: 'ร้านอาหาร' },
  { to: '/admin/menu-items', label: 'เมนูอาหาร' },
  { to: '/admin/audit-logs', label: 'บันทึกการแก้ไขข้อมูล' },
]

export function AdminPage() {
  return (
    <PageShell title="จัดการระบบ">
      <NavLinkList label="เมนูจัดการระบบ" links={adminLinks} />
      <LogoutButton />
    </PageShell>
  )
}
