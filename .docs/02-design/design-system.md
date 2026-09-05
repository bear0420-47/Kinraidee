# Kinraidee Design System

## Status

Draft — 2026-09-06. Tokens recorded from the working prototype `wireframe.html`, which is the design's evidence of record. Pending human approval.

## How to use this file

Every screen an agent or a person draws must use only the values below. If a needed value is missing, add it here first, then use it. Never hardcode a raw colour, radius, or size in a screen.

## Tokens

### Colour

| Token | Value | Role |
|---|---|---|
| `--canvas` | `#1f2125` | Page background |
| `--canvas-soft` | `#26282d` | Recessed background |
| `--surface` | `#222429` | Card and panel surface |
| `--surface-raised` | `#2a2c31` | Raised surface, hover state |
| `--paper` | `#f8f4ef` | Primary text, also `--white` |
| `--muted` | `#b9bdc7` | Secondary text, hints, metadata |
| `--saffron` | `#ffd27a` | Step numbers, section eyebrows, primary accent |
| `--peach` | `#efcfc5` | Soft accent |
| `--peach-deep` | `#4c342f` | Text on peach |
| `--blue` | `#49b6e5` | Informational state |
| `--green` | `#54c98a` | Match and success state |
| `--yellow` | `#f3b544` | Caution state |
| `--glass` | `rgba(34, 36, 41, .96)` | Overlay and dialog surface |
| `--shadow` | `5px 6px 0 rgba(248, 244, 239, .92)` | Standard offset border-shadow |

### Type

- Family: `Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`.
- Display / h1: `clamp(48px, 6.2vw, 74px)`, line-height `.98`, letter-spacing `-.058em`.
- Section h2: `32px` desktop, `27px` at ≤580 px, letter-spacing `-.045em`.
- Card h3: `21px`, letter-spacing `-.03em`.
- Body: `17px`, line-height `1.62`. Compact body / metadata: `13–14px`.
- Eyebrow and field label: `11–12px`, weight `800–850`, letter-spacing `.08–.17em`, uppercase.

### Radius

`9px` (step number) · `12px` (brand mark) · `18px` (toast) · `20px` (step card) · `25px` (result card) · `30px` (dialog) · `999px` (chip, pill, tag).

### Interaction

- Focus ring: `3px solid #d9ffbe`, offset `3px`, on `:focus-visible` for every button, select, and `[tabindex]`.
- Minimum interactive target: `44px` tall (`50px` for selects on mobile).
- Transition: `.25s ease` for transform, `.3s ease` for state colour.

### Breakpoints

- Base: mobile-first.
- `≤850px`: results collapse to two columns; section rail labels hide.
- `≤580px`: single column; chips grow to the 44 px minimum; the section rail hides entirely.
- Content shell: `min(1120px, 100% - 36px)`.

## Component rules

1. Interactive targets are at least 44 px tall. Never ship a smaller tap target.
2. Never hardcode a hex value, radius, or shadow in a screen — reference a token.
3. Every screen has exactly one primary action. Secondary actions use the ghost style.
4. A step card reveals one decision at a time; do not show all conditions at once.
5. Every result card shows price, area, wait, and a one-line reason. If a value is unavailable, say so — never invent it (F3).
6. The focus ring is never removed. `outline: none` without a visible replacement is a defect (NFR12).
7. State changes that matter to the user are announced in a live region, not by colour alone.
8. A destructive or irreversible action (rejecting a choice) offers an undo path.
9. Imagery is generated reference photography and must be labelled as such; it does not depict a named restaurant's actual serving.
10. No screen in the core workflow may present a sign-in wall or an optional-consent wall (F6, LR2).

## Provenance

Tokens above were read from the active `:root` block and component rules in `wireframe.html`. When the prototype and this file disagree, fix one of them in the same change — never leave both standing.
