import {
  BowlFood,
  Flame,
  ForkKnife,
  Heart,
  Leaf,
  Sparkle,
  type Icon,
} from '@phosphor-icons/react'
import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'

import { TasteIcon, tasteIcons } from './tasteIcons'

function markup(element: ReactElement) {
  return render(element).container.innerHTML
}

describe('tasteIcons', () => {
  it('offers exactly the approved registry keys', () => {
    expect(tasteIcons.keys).toEqual([
      'flame',
      'leaf',
      'sparkles',
      'heart',
      'bowl',
    ])
  })

  it.each<[string, Icon]>([
    ['flame', Flame],
    ['leaf', Leaf],
    ['sparkles', Sparkle],
    ['heart', Heart],
    ['bowl', BowlFood],
  ])('renders %s with its Phosphor icon', (key, Expected) => {
    expect(markup(<TasteIcon icon={key} />)).toBe(markup(<Expected />))
  })

  it.each([null, 'rice', 'toString', '<svg></svg>'])(
    'renders the ForkKnife fallback for %s',
    (key) => {
      expect(markup(<TasteIcon icon={key} />)).toBe(markup(<ForkKnife />))
    },
  )
})
