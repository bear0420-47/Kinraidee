# Kinraidee Design System

## Status

Approved style baseline — 2026-09-28. Visual language, tokens, and component styling are extracted from `wireframe.html` only. Product scope, user flow, and feature behavior remain governed by the specification, backlog, journey, data model, and implementation plan.

`wireframe.html` is a style reference, not a requirements source. Do not implement GPS/current-location, allergy/profile exclusions, group voting, wait-time display, or any other out-of-scope mock feature just because it appears in the wireframe.

## Visual Direction

Kinraidee uses a playful notebook-and-doodle style:

- Bright paper canvas with dark ink outlines.
- Slightly irregular radii and offset shadows to feel hand-drawn.
- Friendly rounded typography with decorative handwritten headings.
- Food photography or generated placeholder imagery inside paper-card frames.
- One focused decision step at a time.
- Mobile-first screens with generous tap targets and bottom-friendly actions.

## Tokens

### Colour

| Token | Value | Role |
|---|---|---|
| `--canvas` | `#ffffff` | Main page background |
| `--canvas-soft` | `#faf8f5` | Warm recessed background |
| `--surface` | `#ffffff` | Main card and dialog surface |
| `--surface-raised` | `#faf8f5` | Raised/alternate paper surface |
| `--paper` | `#263d4b` | Ink colour: text, borders, icon strokes |
| `--muted` | `#56636c` | Secondary copy and helper text |
| `--peach` | `#efcfc5` | Soft primary accent panels and buttons |
| `--peach-deep` | `#fae7df` | Pale peach fill and hover accent |
| `--blue` | `#49b6e5` | Informational accent |
| `--green` | `#54c98a` | Success/match accent |
| `--yellow` | `#f3b544` | Selected option / warm highlight |
| `--ice` | `#d8eef8` | Saved/favorite/profile accent |
| `--cream` | `#fff8df` | Note panel surface |
| `--rust` | `#694538` | Price and warm emphasis text |
| `--line-soft` | `#d8dfe2` | Soft divider or disabled border |
| `--focus` | `#d9ffbe` | Focus ring |
| `--glass` | `rgba(255, 255, 255, .96)` | Overlay/dialog/card translucent surface |
| `--shadow` | `5px 6px 0 #263d4b` | Primary doodle shadow |

Raw colours are not used directly in implementation files. Add a token first when a new value is necessary.

### Typography

| Token | Value | Role |
|---|---|---|
| `--font-body` | `Nunito, ui-sans-serif, system-ui, sans-serif` | Body, controls, cards |
| `--font-display` | `"Delius Swash Caps", cursive` | Main headings, decorative labels, selected meal names |
| `--text-hero` | `clamp(48px, 6.2vw, 74px)` | Desktop hero heading |
| `--text-hero-mobile` | `clamp(42px, 12.5vw, 49px)` | Mobile hero heading |
| `--text-section` | `32px` | Section heading |
| `--text-section-mobile` | `27px` | Mobile section heading |
| `--text-card-title` | `21px` | Card heading |
| `--text-body` | `16px` | Main body copy |
| `--text-small` | `13px` | Helper copy, metadata |
| `--text-eyebrow` | `11px` | Uppercase labels |

Rules:

- Body line-height uses `1.55–1.65`.
- Display headings use tight line-height around `0.98–1.05`.
- Eyebrows use uppercase, heavy weight, and wide letter spacing.
- Do not replace visible text with decorative font if readability suffers on mobile.

### Spacing

| Token | Value | Role |
|---|---|---|
| `--space-1` | `4px` | Tiny internal gap |
| `--space-2` | `6px` | Dense doodle gap |
| `--space-3` | `8px` | Compact control gap |
| `--space-4` | `10px` | Small padding |
| `--space-5` | `12px` | Standard chip padding/gap |
| `--space-6` | `14px` | Card metadata gap |
| `--space-7` | `16px` | Default layout gap |
| `--space-8` | `18px` | Section/card gap |
| `--space-9` | `20px` | Panel spacing |
| `--space-10` | `24px` | Large section spacing |
| `--space-11` | `32px` | Desktop layout gap |
| `--shell` | `min(1120px, 100% - 36px)` | Page shell width |

### Radius

| Token | Value | Role |
|---|---|---|
| `--radius-xs` | `4px` | Tiny tags / hand-drawn corners |
| `--radius-sm` | `8px` | Inputs and compact cards |
| `--radius-md` | `12px` | Brand mark / medium controls |
| `--radius-lg` | `20px` | Step card / main panels |
| `--radius-xl` | `25px` | Result cards |
| `--radius-dialog` | `30px` | Dialogs |
| `--radius-pill` | `999px` | Pills, chips, rounded buttons |

Use slight asymmetric radii for doodle surfaces when practical, e.g. `6px 12px 5px 10px` or `8px 16px 7px 14px`. Keep the tokenized radius as the base decision.

### Borders And Shadows

| Token | Value | Role |
|---|---|---|
| `--border-ink` | `2px solid var(--paper)` | Primary hand-drawn border |
| `--border-soft` | `1px dashed var(--line-soft)` | Dividers and secondary panels |
| `--shadow-sm` | `2px 2px 0 var(--paper)` | Selected chips / small cards |
| `--shadow-md` | `3px 4px 0 var(--paper)` | Buttons and compact cards |
| `--shadow-lg` | `5px 6px 0 var(--paper)` | Main cards and dialogs |
| `--shadow-soft` | `0 9px 24px rgba(15, 23, 42, .18)` | Image/photo depth |

### Breakpoints

| Breakpoint | Rule |
|---|---|
| Base | Mobile-first layout |
| `360px` | Very narrow phones; collapse dense grids to one column |
| `580px` | Main mobile breakpoint; single-column results and larger tap targets |
| `720px` | Tablet adjustments for layout density |
| `900px` | Results and supporting panels reduce columns |
| `980px` | Desktop layout boundary for multi-column hero/results |
| Reduced motion | Disable decorative animation and nonessential transitions |

## Component Style Rules

### Buttons

- Primary buttons use peach/yellow fills, dark ink border, and offset shadow.
- Secondary buttons use white/paper fill with ink border.
- Ghost buttons keep a border and no heavy fill.
- Minimum target height is `44px`; mobile controls prefer `48–52px`.
- Pressed/selected state may rotate or offset slightly, but must not impair readability.

### Choice Chips

- Chips are pill or asymmetric rounded cards with `2px` ink border.
- Selected chips use `--yellow` fill, `--paper` border, and `--shadow-sm`.
- Each choice group is visually distinct with icon/shape/card layout, but all share the same selected-state language.
- Budget `50–100` may appear as a quick-select option, but no budget is preselected by default.

### Step Cards

- Step cards are paper panels with ink borders and offset shadows.
- Show one decision step at a time for the core recommendation flow.
- Completed steps show a clear picked/completed state, not colour alone.
- Progress indicators are supportive; they do not replace field-level validation.

### Result Cards

- Result cards use large food imagery, a paper surface, dark ink border, and offset shadow.
- Each card shows menu name, restaurant, price, zone, and a one-line reason/rationale.
- Recommendation results first appear as up to three face-down shuffle cards. Revealed cards use the normal result-card treatment.
- Provide an `เปิดทั้งหมด` action so users can skip the reveal interaction.
- Card flip/reveal motion must be short and respect `prefers-reduced-motion`.
- Do not display wait time.
- Do not invent missing values; show unavailable only when the spec allows the field to be absent.
- Soft-deleted menu items may appear only in account history/favorites with an unavailable status, never in public recommendation results.

### Dialogs And Overlays

- Dialogs use `--glass`/paper surfaces, ink borders, large radius, and focus trapping.
- Opening a dialog moves focus into the dialog; closing returns focus to the trigger.
- Non-dialog page content must be inert while a modal dialog is open.
- Selected-menu confirmation shows menu name, restaurant, price, zone, image, and rationale. It never shows wait time.
- Confirmation uses playful Thai actions. Stage 1 provides `เอาเมนูนี้แหละ` as the primary action and `ขอคิดอีกที` as the secondary action. The success state provides only `กลับหน้าหลัก`.

### Toast And Undo

- State changes that matter to the user use a visible message and a live-region announcement.
- Rejecting a choice must offer undo in the current session.
- Undo restores the rejected card in its original slot and reveal state, removes the replacement card, and reverses the rejected-ID change.
- Toast text must name the changed item when possible.

### Navigation

- Use a lightweight header with brand and one or two primary navigation actions.
- Anonymous users see `เข้าสู่ระบบ`; authenticated `USER` accounts see `บัญชีของฉัน`; authenticated `ADMIN` accounts see `จัดการระบบ` in the same header slot.
- Treat account and administrator entries as secondary navigation. They must not visually compete with the current screen's primary action.

### Icons

- Use `@phosphor-icons/react` as the only application icon set.
- Do not handwrite, copy, generate, or embed custom SVG icon paths in application code.
- Do not carry the inline SVG sprite from `wireframe.html` into the React application; it is a visual reference only.
- Use a controlled icon registry for database-backed keys such as FoodType icons. Unknown or null keys use the approved Phosphor fallback icon.
- Import only the Phosphor icons the application uses. Do not import the full icon package namespace.
- Use Phosphor weight and sizing consistently with the component rules; icon color inherits `currentColor` unless an approved token specifies otherwise.
- Section dots/rails are allowed on desktop but hidden or simplified on small screens.
- Do not create a sign-in wall for the core F1–F7 recommendation workflow.

### Imagery

- Use food imagery only as representative visual support unless the image is confirmed to depict the actual restaurant/menu item.
- Generated placeholders must not be presented as real restaurant photos.
- Images are displayed from approved external URLs or API-served development/test upload URLs; binary image data is never stored in PostgreSQL. Production internal uploads remain disabled until durable object storage is implemented.

## Accessibility Rules

- Every interactive control has a visible `:focus-visible` state using `--focus` or an approved equivalent.
- Do not use `outline: none` without a visible replacement.
- Custom selects must preserve keyboard operation: open, arrow navigation, select, escape, and focus return.
- Announce important state changes through a live region.
- Respect `prefers-reduced-motion` for decorative animation and nonessential transitions.
- Do not rely on colour alone for selected, completed, unavailable, or error states.

## Out-Of-Scope Mock Elements

The current `wireframe.html` may contain exploratory controls that are not approved for the first release. These must not be implemented from the wireframe unless a later approved requirement changes the scope:

- Current-location/GPS controls.
- Allergy, food-exclusion, health, or religious preference capture.
- Group voting.
- Wait-time display.
- Public production deployment flows.
- Password reset/change flows.

## Implementation Notes

- React/Tailwind implementation should translate these tokens into Tailwind theme values or CSS variables.
- Do not copy `wireframe.html` wholesale into React. Use it as a visual reference only.
- Product behavior comes from the specification, backlog, user journey, data model, and implementation issues.
- If visual implementation and this file disagree, update this file first or record an approved design decision before changing code.
