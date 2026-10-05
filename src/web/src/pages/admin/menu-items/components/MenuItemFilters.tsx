import { MagnifyingGlass } from '@phosphor-icons/react'
import { useState, type FormEvent } from 'react'

import { Button } from '@/components/Button'
import { SelectField } from '@/components/SelectField'
import { TextField } from '@/components/TextField'
import type { FoodType } from '@/schemas/admin/food-types/foodTypeSchemas'
import type { MenuItemFilters as Filters } from '@/schemas/admin/menu-items/menuItemSchemas'
import type { Restaurant } from '@/schemas/admin/restaurants/restaurantSchemas'
import type { Taste } from '@/schemas/admin/tastes/tasteSchemas'

type MenuItemFiltersProps = {
  filters: Filters
  restaurants: Restaurant[]
  foodTypes: FoodType[]
  tastes: Taste[]
  // Receives the changed filters; the page resets to page 1.
  onChange: (changes: Partial<Omit<Filters, 'page'>>) => void
}

// Search applies on submit; the selects and the deleted-records filter apply immediately.
export function MenuItemFilters({
  filters,
  restaurants,
  foodTypes,
  tastes,
  onChange,
}: MenuItemFiltersProps) {
  const [search, setSearch] = useState(filters.search)

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onChange({ search })
  }

  return (
    <form
      role="search"
      aria-label="ตัวกรองเมนูอาหาร"
      className="grid grid-cols-1 gap-4 rounded-lg border-2 border-line-soft bg-canvas-soft p-4 md:grid-cols-3 md:items-end"
      onSubmit={submitSearch}
    >
      <div className="flex items-end gap-3 md:col-span-3">
        <div className="min-w-0 grow">
          <TextField
            id="menu-item-search"
            type="search"
            label="ค้นหาชื่อเมนู"
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
        id="menu-item-restaurant-filter"
        label="ร้านอาหาร"
        value={filters.restaurantId}
        onChange={(event) => onChange({ restaurantId: event.target.value })}
      >
        <option value="">ทุกร้าน</option>
        {restaurants.map((restaurant) => (
          <option key={restaurant.id} value={restaurant.id}>
            {restaurant.name.th}
            {restaurant.deletedAt ? ' (ลบแล้ว)' : ''}
          </option>
        ))}
      </SelectField>
      <SelectField
        id="menu-item-food-type-filter"
        label="ประเภทอาหาร"
        value={filters.foodTypeId}
        onChange={(event) => onChange({ foodTypeId: event.target.value })}
      >
        <option value="">ทุกประเภท</option>
        {foodTypes.map((foodType) => (
          <option key={foodType.id} value={foodType.id}>
            {foodType.name.th}
          </option>
        ))}
      </SelectField>
      <SelectField
        id="menu-item-taste-filter"
        label="รสชาติ"
        value={filters.tasteId}
        onChange={(event) => onChange({ tasteId: event.target.value })}
      >
        <option value="">ทุกรสชาติ</option>
        {tastes.map((taste) => (
          <option key={taste.id} value={taste.id}>
            {taste.name.th}
          </option>
        ))}
      </SelectField>
      <label className="flex items-center gap-3 font-bold md:col-span-3">
        <input
          type="checkbox"
          className="h-5 w-5 accent-paper"
          checked={filters.includeDeleted}
          onChange={(event) =>
            onChange({ includeDeleted: event.target.checked })
          }
        />
        แสดงเมนูที่ลบแล้ว
      </label>
    </form>
  )
}
