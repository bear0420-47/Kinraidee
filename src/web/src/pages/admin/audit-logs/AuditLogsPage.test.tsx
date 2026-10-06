import { fireEvent, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import {
  fakeAuthApi,
  jsonResponse,
  renderApp,
  testAdmin,
  testUser,
} from '@/test/renderApp'

const auditLog = {
  id: 'audit_1',
  actorId: 'admin_1',
  action: 'UPDATE',
  entityType: 'MENU_ITEM',
  entityId: 'menu_1',
  before: { name: 'เมนูเดิม' },
  after: { name: 'เมนูใหม่', password: '[REDACTED]' },
  requestId: 'req_1',
  createdAt: '2026-09-30T00:00:00.000Z',
}

function fakeAuditLogsApi(
  items: (typeof auditLog)[] = [auditLog],
  meta = { page: 1, pageSize: 20, total: items.length },
) {
  return fakeAuthApi({
    currentUser: testAdmin,
    responses: {
      'GET /api/audit-logs': () => jsonResponse(200, { data: { items }, meta }),
    },
  })
}

describe('AuditLogsPage', () => {
  it('shows the approved notices and read-only expandable snapshots', async () => {
    fakeAuditLogsApi()
    const { user } = renderApp('/admin/audit-logs')

    expect(
      await screen.findByRole('heading', { name: 'บันทึกการแก้ไขระบบ' }),
    ).toBeTruthy()
    expect(
      screen.getByText(
        'บันทึกนี้เป็น application audit log ไม่ใช่ traffic log ตามกฎหมายคอมพิวเตอร์',
      ),
    ).toBeTruthy()
    expect(
      screen.getByText('ระบบเก็บบันทึกนี้ 180 วันตาม retention policy'),
    ).toBeTruthy()

    const table = await screen.findByRole('table', {
      name: 'รายการบันทึกการแก้ไขระบบ',
    })
    // Record and action types show Thai labels, never the API's enum values.
    expect(within(table).getByText('เมนูอาหาร')).toBeTruthy()
    expect(within(table).getByText('แก้ไข')).toBeTruthy()
    expect(table.textContent).not.toContain('MENU_ITEM')
    expect(table.textContent).not.toContain('UPDATE')
    expect(table.textContent).toContain('admin_1')
    expect(table.textContent).toContain('[REDACTED]')
    expect(table.textContent).not.toContain('admin@example.com')
    const before = within(table).getByText('ก่อนแก้ไข')
    expect(before.closest('details')?.hasAttribute('open')).toBe(false)
    expect(within(table).queryByRole('textbox')).toBeNull()

    const keydown = vi.fn()
    before.addEventListener('keydown', keydown)
    before.focus()
    await user.keyboard('{Enter}')
    expect(document.activeElement).toBe(before)
    expect(keydown).toHaveBeenCalled()
    await user.click(before)
    expect(before.closest('details')?.hasAttribute('open')).toBe(true)
  })

  it('shows the approved empty state', async () => {
    fakeAuditLogsApi([])
    renderApp('/admin/audit-logs')

    expect(await screen.findByText('ยังไม่มีบันทึกการแก้ไข')).toBeTruthy()
  })

  it('applies filters and pages through results', async () => {
    fakeAuditLogsApi([auditLog], { page: 1, pageSize: 20, total: 21 })
    const { user } = renderApp('/admin/audit-logs')
    await screen.findByRole('table')

    await user.selectOptions(screen.getByLabelText('ประเภทข้อมูล'), 'MENU_ITEM')
    await user.selectOptions(screen.getByLabelText('การทำงาน'), 'UPDATE')
    await user.type(screen.getByLabelText('Actor ID'), 'admin_1')
    await user.type(screen.getByLabelText('Entity ID'), 'menu_1')
    await user.type(screen.getByLabelText('Request ID'), 'req_1')
    await user.selectOptions(screen.getByLabelText('จำนวนต่อหน้า'), '50')
    fireEvent.change(screen.getByLabelText('ตั้งแต่เวลา'), {
      target: { value: '2026-09-01T00:00' },
    })
    fireEvent.change(screen.getByLabelText('ถึงเวลา'), {
      target: { value: '2026-09-30T23:59' },
    })
    await user.click(screen.getByRole('button', { name: 'กรองรายการ' }))
    await user.click(screen.getByRole('button', { name: 'ถัดไป' }))

    const auditRequests = vi
      .mocked(fetch)
      .mock.calls.map(([request]) => request as Request)
      .filter((request) => new URL(request.url).pathname === '/api/audit-logs')
    const filterUrl = new URL(auditRequests.at(-2)?.url ?? '')
    const pageUrl = new URL(auditRequests.at(-1)?.url ?? '')
    expect(filterUrl.searchParams.get('entityType')).toBe('MENU_ITEM')
    expect(filterUrl.searchParams.get('action')).toBe('UPDATE')
    expect(filterUrl.searchParams.get('actorId')).toBe('admin_1')
    expect(filterUrl.searchParams.get('entityId')).toBe('menu_1')
    expect(filterUrl.searchParams.get('requestId')).toBe('req_1')
    expect(filterUrl.searchParams.get('pageSize')).toBe('50')
    expect(filterUrl.searchParams.get('createdFrom')).toBe(
      new Date('2026-09-01T00:00').toISOString(),
    )
    expect(filterUrl.searchParams.get('createdTo')).toBe(
      new Date('2026-09-30T23:59').toISOString(),
    )
    expect(pageUrl.searchParams.get('page')).toBe('2')
  })

  it('keeps the ADMIN route guard in front of the page', async () => {
    fakeAuthApi({ currentUser: testUser })
    renderApp('/admin/audit-logs')

    expect(
      await screen.findByRole('heading', { name: 'บัญชีของฉัน' }),
    ).toBeTruthy()
    expect(screen.queryByText('บันทึกการแก้ไขระบบ')).toBeNull()
  })
})
