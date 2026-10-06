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
| `--font-body` | `Nunito, "Noto Sans Thai", ui-sans-serif, system-ui, sans-serif` | Body, buttons, forms, cards |
| `--font-display` | `"Delius Swash Caps", Mali, cursive` | Main headings and decorative labels in the Doodle style; the Kinraidee wordmark always uses it |
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
- Nunito and Delius Swash Caps have no Thai glyphs, so Thai text falls back to Noto Sans Thai (body) and Mali (headings).
- Admin screens (`/admin/*`, including their dialogs) use the body font for headings as well as record names, for readability. The brand wordmark keeps the display font.
- Fonts are self-hosted with the application bundle; no third-party font service is requested.

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
- Minimum target height is `44px`; mobile controls prefer `48–52px`. Exception: compact row actions in dense admin tables (currently the MenuItem table) are `40px`, still well above the WCAG 2.2 `24px` minimum.
- Soft buttons use a faint yellow fill (`yellow` at 25%, a soft orange on white) for a positive secondary action such as `กู้คืน`.
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
- Condition choices are native radio buttons styled as choice chips, so arrow keys move the selection and exactly one option can be chosen. A step heading receives focus when the step changes, and the progress copy reads `ข้อ {n} จาก 4`.
- Every step ends with the same footer: a divider, then `ย้อนกลับ` on the left and the forward action on the right. The choices area has a shared minimum height, so the footer stays in the same place from step to step.
- Large Thai display headings need extra room above them for tone marks; do not set them with `leading-none`.
- A primary action that is not yet available stays visible but disabled, with a short note that explains why.

### Result Cards

- Result cards use large food imagery, a paper surface, dark ink border, and offset shadow.
- Each card shows menu name, restaurant, price, zone, and a one-line reason/rationale.
- Recommendation results first appear as up to three face-down shuffle cards. Revealed cards use the normal result-card treatment.
- Provide an `เปิดทั้งหมด` action so users can skip the reveal interaction.
- Card flip/reveal motion must be short and respect `prefers-reduced-motion`.
- Do not display wait time.
- Do not invent missing values; show unavailable only when the spec allows the field to be absent.
- Soft-deleted menu items may appear only in account history/favorites with an unavailable status, never in public recommendation results.

- In the React flow, a card has four visible states, each stated in text and not by colour or motion alone: face-down (`การ์ดใบที่ {n}` with `ยังไม่เปิด`), revealed (menu details and actions), finding a replacement (`กำลังหาเมนูใหม่…`), and no more options (`ไม่มีตัวเลือกเพิ่มแล้ว`). The reveal animation runs only under `prefers-reduced-motion: no-preference`.
- A revealed card's photo is a `160px` strip across the card top, cropped to fill (`object-cover`), and the price sits beside the menu name, so a revealed card fits on a laptop screen. Revealing, replacing, or restoring a card scrolls the whole card into view (smoothly, or instantly under reduced motion) so its actions are visible. A card without a photo, or whose photo cannot load, shows a same-size panel with the food-type icon and `ไม่มีรูปเมนู` / `โหลดรูปไม่ได้`, so every revealed card lines up.

### Dialogs And Overlays

- Dialogs use `--glass`/paper surfaces, ink borders, large radius, and focus trapping.
- Opening a dialog moves focus into the dialog; closing returns focus to the trigger.
- Non-dialog page content must be inert while a modal dialog is open.
- Selected-menu confirmation shows menu name, restaurant, price, zone, image, and rationale. It never shows wait time.
- Confirmation uses playful Thai actions. Stage 1 provides `เอาเมนูนี้แหละ` as the primary action and `ขอคิดอีกที` as the secondary action. The success state provides only `กลับหน้าหลัก`.
- In the React flow both stages share one dialog. Stage 1 (`เลือกเมนูนี้ใช่ไหม?`) shows the photo, or the card's fallback panel, at a full `4:3` ratio, framed with the default radius. The success stage (`ได้มื้อนี้แล้ว!`) shows a Phosphor `Confetti` icon and the message, announced in a status region, and moves focus to `กลับหน้าหลัก`. Escape closes stage 1 like `ขอคิดอีกที`, and on the success stage acts as `กลับหน้าหลัก`.

### Favorites

- A favorite is a round `44px` heart button overlaid on the top-right corner of a menu photo, on revealed cards and in the confirmation dialog. Not saved: an outline Phosphor `Heart` on `--surface`. Saved: a filled `Heart` on the `--ice` accent. The state is carried by the heart's shape, the label (`บันทึกเป็นเมนูโปรด` / `นำออกจากเมนูโปรด`), and `aria-pressed`, never by colour alone.
- Signed out, the same heart (without `aria-pressed`) leads to login, where `เข้าสู่ระบบเพื่อบันทึกเมนูโปรด` is announced. A failed save shows a short alert under the heart.
- The confirmation dialog still opens with focus on `ขอคิดอีกที`, although the heart comes first in reading order.
- The `/account/favorites` list shows one bordered row per favorite: an `80px` photo (or the dashed `ไม่มีรูป` placeholder), Thai and English names, Restaurant, price, and a compact secondary `นำออกจากเมนูโปรด` button whose description is the menu name.
- An unavailable favorite carries the `เมนูนี้ไม่พร้อมใช้งานแล้ว` pill with a Phosphor `Prohibit` icon, so its status is stated in text. It offers removal only.

### Saved Preferences

- `/account/preferences` is a single form of four labelled native selects (budget, taste, food type, zone). Each select's first option is `ไม่ตั้งค่า` (no default). Taste, food type, and zone then offer their "any" choice (`อะไรก็ได้` / `ที่ไหนก็ได้`) as a real saved value, then their records. Budget has no "any", because the meal flow always asks for a budget range.
- A save with every select on `ไม่ตั้งค่า` shows its error under the first select, linked to it, and focus moves there. Save and clear results are announced in a status region.
- `ล้างค่าเริ่มต้น` is always shown so it can be found. With nothing saved it is disabled and described by the `ยังไม่ได้ตั้งค่าเริ่มต้น` line; otherwise it always asks for confirmation in the shared confirm dialog before deleting.
- In the meal flow, a saved default appears as the already-selected chip on its step, with no extra note.

### Selected-Menu History

- `/account/history` uses the same menu row as favorites (photo, names, Restaurant, price, and the `เมนูนี้ไม่พร้อมใช้งานแล้ว` pill when unavailable), plus a `เลือกเมื่อ {date}` line in Thai locale. The list is newest first and paged with the shared pagination controls.
- `ล้างประวัติทั้งหมด` is always shown, disabled with nothing to clear, and asks `ล้างประวัติทั้งหมด?` with `การล้างประวัติจะลบรายการที่คุณเคยเลือกทั้งหมด` before deleting. The result `ล้างประวัติแล้ว` is announced.
- When saving history fails after `เอาเมนูนี้แหละ`, the success stage still shows, with `เลือกเมนูสำเร็จ แต่บันทึกประวัติไม่สำเร็จ` as an announced warning under the message.

### Admin Tables And Bulk Selection

- Admin tables share one cell style; the actions column sits at the right edge with its header centred over the buttons.
- Admin pages use the `1120px` shell. A data-dense table page, such as MenuItems, may use the `1240px` extra-wide card so the table fits without horizontal scrolling on desktop.
- When a table shows images, the image is the first content column at `80px` square; a record without an image shows a dashed `ไม่มีรูป` placeholder of the same size so rows stay aligned.
- A table image is a button labelled `ดูรูปเต็ม {name}` that opens the whole, uncropped image in a wide modal (a lightbox) with a `ปิด` button. It follows the dialog rules: Escape closes it and focus returns to the image.
- A selectable table puts a labelled checkbox first in each row (before the image) and a labelled "select all on this page" checkbox in the header.
- The bulk-action bar sits above the table. It always shows the selected count in a live region and the per-action limit, and each bulk button's accessible name includes the count.
- A blocked bulk action stays visible but disabled, with the reason as text next to it.
- Multi-value choices in admin forms, such as MenuItem tastes, use a labelled checkbox group with the icon beside the name.
- Prices show whole baht with Thai digit grouping, such as `฿1,250`.

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
