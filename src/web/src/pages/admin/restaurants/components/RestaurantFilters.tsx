import { MagnifyingGlass } from '@phosphor-icons/react'
import { useState, type FormEvent } from 'react'

import { Button } from '@/components/Button'
import { SelectField } from '@/components/SelectField'
import { TextField } from '@/components/TextField'
import type { RestaurantFilters as Filters } from '@/schemas/admin/restaurants/restaurantSchemas'
import type { Zone } from '@/schemas/admin/zones/zoneSchemas'

type RestaurantFiltersProps = {
  filters: Filters
  zones: Zone[]
  // Receives the changed filters; the page resets to page 1.
  onChange: (changes: Partial<Omit<Filters, 'page'>>) => void
}

// Search applies on submit; the Zone and deleted-records filters apply immediately.
export function RestaurantFilters({
  filters,
  zones,
  onChange,
}: RestaurantFiltersProps) {
  const [search, setSearch] = useState(filters.search)

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onChange({ search })
  }

  return (
    <form
      role="search"
      aria-label="ตัวกรองร้านอาหาร"
      className="grid grid-cols-1 gap-4 rounded-lg border-2 border-line-soft bg-canvas-soft p-4 md:grid-cols-[2fr_1fr] md:items-end"
      onSubmit={submitSearch}
    >
      <div className="flex items-end gap-3">
        <div className="min-w-0 grow">
          <TextField
            id="restaurant-search"
            type="search"
            label="ค้นหาชื่อร้าน"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <Button type="submit" variant="secondary">
          <MagnifyingGlass aria-hidden weight="bold" />
          ค้นหา
        </Button>
      </div>
      <SelectField
        id="restaurant-zone-filter"
        label="โซน"
        value={filters.zoneId}
        onChange={(event) => onChange({ zoneId: event.target.value })}
      >
        <option value="">ทุกโซน</option>
        {zones.map((zone) => (
          <option key={zone.id} value={zone.id}>
            {zone.name.th}
          </option>
        ))}
      </SelectField>
      <label className="flex items-center gap-3 font-bold md:col-span-2">
        <input
          type="checkbox"
          className="h-5 w-5 accent-paper"
          checked={filters.includeDeleted}
          onChange={(event) =>
            onChange({ includeDeleted: event.target.checked })
          }
        />
        แสดงร้านที่ลบแล้ว
      </label>
    </form>
  )
}
