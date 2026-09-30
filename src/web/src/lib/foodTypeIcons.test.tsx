import {
  BowlFood,
  BowlSteam,
  CookingPot,
  ForkKnife,
  Hamburger,
  Leaf,
  Sparkle,
  type Icon,
} from '@phosphor-icons/react'
import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'

import { FoodTypeIcon, foodTypeIcons } from './foodTypeIcons'

function markup(element: ReactElement) {
  return render(element).container.innerHTML
}

describe('foodTypeIcons', () => {
  it('offers exactly the approved registry keys', () => {
    expect(foodTypeIcons.keys).toEqual([
      'rice',
      'noodles',
      'sandwich',
      'soup',
      'salad',
      'sparkles',
    ])
  })

  it.each<[string, Icon]>([
    ['rice', BowlFood],
    ['noodles', BowlSteam],
    ['sandwich', Hamburger],
    ['soup', CookingPot],
    ['salad', Leaf],
    ['sparkles', Sparkle],
  ])('renders %s with its Phosphor icon', (key, Expected) => {
    expect(markup(<FoodTypeIcon icon={key} />)).toBe(markup(<Expected />))
  })

  it.each([null, 'dumpling', 'constructor', '<svg></svg>'])(
    'renders the ForkKnife fallback for %s',
    (key) => {
      expect(markup(<FoodTypeIcon icon={key} />)).toBe(markup(<ForkKnife />))
    },
  )
})
