import type {
  CardSlot,
  RecommendationItem,
  Shortlist,
} from './recommendationSchemas'

// Pure shortlist transitions. Revealing is presentation only: it never asks the API again.

export function startShortlist(items: RecommendationItem[]): Shortlist {
  return {
    slots: items.map((item) => ({ kind: 'card', item, revealed: false })),
    rejectedMenuItemIds: [],
    undo: null,
  }
}

function mapCard(
  shortlist: Shortlist,
  update: (slot: CardSlot, index: number) => CardSlot,
): Shortlist {
  return {
    ...shortlist,
    slots: shortlist.slots.map((slot, index) =>
      slot.kind === 'card' ? update(slot, index) : slot,
    ),
  }
}

export function revealCard(shortlist: Shortlist, slotIndex: number) {
  return mapCard(shortlist, (slot, index) =>
    index === slotIndex ? { ...slot, revealed: true } : slot,
  )
}

export function revealAll(shortlist: Shortlist) {
  return mapCard(shortlist, (slot) => ({ ...slot, revealed: true }))
}

// Opens confirmation for a revealed card. Only its ID is kept; the item comes from its slot.
export function chooseCard(
  shortlist: Shortlist,
  menuItemId: string,
): Shortlist {
  return { ...shortlist, chosenMenuItemId: menuItemId }
}

export function clearChoice({
  chosenMenuItemId: _chosen,
  confirmed: _confirmed,
  ...shortlist
}: Shortlist): Shortlist {
  return shortlist
}

// `เอาเมนูนี้แหละ` was pressed: a reload shows the success stage, never the question again.
export function confirmChoice(shortlist: Shortlist): Shortlist {
  return { ...shortlist, confirmed: true }
}

// The card being confirmed, while it is still a revealed card in the shortlist.
export function chosenItem(shortlist: Shortlist): RecommendationItem | null {
  const slot = shortlist.slots.find(
    (candidate): candidate is CardSlot =>
      candidate.kind === 'card' &&
      candidate.revealed &&
      candidate.item.id === shortlist.chosenMenuItemId,
  )
  return slot?.item ?? null
}

export function hasFaceDownCard(shortlist: Shortlist) {
  return shortlist.slots.some((slot) => slot.kind === 'card' && !slot.revealed)
}

// Rejects the card in `slotIndex` and puts its replacement there face-down, or marks the slot
// as having no more options. Only this latest rejection can be undone.
export function replaceCard(
  shortlist: Shortlist,
  slotIndex: number,
  replacement: RecommendationItem | null,
): Shortlist {
  const previous = shortlist.slots[slotIndex]
  if (previous?.kind !== 'card') return shortlist

  return {
    slots: shortlist.slots.map((slot, index) =>
      index !== slotIndex
        ? slot
        : replacement
          ? { kind: 'card', item: replacement, revealed: false }
          : { kind: 'exhausted' },
    ),
    rejectedMenuItemIds: [...shortlist.rejectedMenuItemIds, previous.item.id],
    undo: { slotIndex, previous, rejectedId: previous.item.id },
  }
}

// Restores the rejected card in its slot and reveal state, drops the replacement, and takes
// the card's ID back out of the rejected list.
export function undoReject(shortlist: Shortlist): Shortlist {
  const { undo } = shortlist
  if (!undo) return shortlist

  return {
    slots: shortlist.slots.map((slot, index) =>
      index === undo.slotIndex ? undo.previous : slot,
    ),
    rejectedMenuItemIds: shortlist.rejectedMenuItemIds.filter(
      (id) => id !== undo.rejectedId,
    ),
    undo: null,
  }
}
