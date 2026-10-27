# Verification Report

## Account child-page Back placement — 2026-10-27

Favorites, selected-menu History and default Preferences now show one shared Back link above their cards, returning to `/account`. The existing three page suites passed 30/30, including checks that Back is outside the card and still navigates through the account flow. Web TypeScript, scoped ESLint, scoped Prettier, `git diff --check` and Vite build passed. The build reported existing third-party comment and large chunk warnings. No authenticated browser screenshot or deployment check was performed for these child pages.

Local 390px Opera component previews using an example user and empty account data: `artifacts/account-favorites-back-390.png`, `artifacts/account-history-back-390.png`, and `artifacts/account-preferences-back-390.png`. All show Back above the card; the temporary preview entry was removed after capture. These previews do not establish authenticated API behavior.

## Account Back above the card — 2026-10-27

The Back action now sits above the `/account` paper card and keeps its previous-entry/Home fallback. The duplicate Home link inside the card was removed; the shared header still provides Home. A 390px Opera component preview using an example local user is saved as `artifacts/account-back-above-card-390.png`; its temporary preview entry was removed after capture. This is visual component evidence, not an authenticated session. Web TypeScript, focused `SiteHeader.test.tsx` (5/5), scoped ESLint, scoped Prettier, `git diff --check`, and Vite build passed. The build reported existing third-party comment and large chunk warnings.

## Smaller mobile result actions — 2026-10-27

At a 390px Opera viewport against the local Vite web, API and PostgreSQL data, the two result actions appear side by side as icon buttons. Browser measurement found each button 44×44px and document width 376px within the 390px viewport. Their accessible names remain `เปลี่ยนตัวเลือก` and `เริ่มใหม่`; the new screenshot is `artifacts/mobile-results-390-icons.png`. At 1024px, both full text labels were visible. Web TypeScript passed; focused `ShuffleCards.test.tsx` passed 36/36; scoped ESLint, Prettier and `git diff --check` passed. Web Vite production build passed with existing third-party comment and large chunk warnings. This is local browser evidence, not deployment or physical-device verification.

## Compact mobile result header actions — 2026-10-27

The result heading now shares a mobile row with two stacked compact action buttons at the right; desktop action layout remains a two-column row. Web TypeScript and scoped Prettier passed. Focused Vitest and Vite build could not start because esbuild reported `Cannot read directory "../../../../..": Access is denied` while loading `vite.config.ts`. ESLint could not start because local `ajv` is missing. Subsequently, the local Vite web, API, and existing PostgreSQL container served a real recommendation flow in Opera at a 390px viewport. The resulting screen visibly showed both compact buttons to the right of the heading with no visible header overflow; screenshot: `artifacts/mobile-results-390.png`. This checks the local UI only, not deployment or a physical phone.

## Account back navigation — 2026-10-27

Added the `/account` Back button and a direct-entry fallback test. Web TypeScript `tsc --noEmit -p src/web/tsconfig.json` passed. The focused Vitest suite and Vite build could not start: esbuild reported `Cannot read directory "../../../../..": Access is denied` while loading `vite.config.ts`. ESLint could not start because the installed dependency tree lacks `ajv`. These checks remain unverified in this environment.

Later visual preview: `artifacts/account-back-mobile-preview.png` renders the real `AccountPage` component at 390px with a local example user and the `ย้อนกลับ` button directly below the heading. The temporary preview entry was removed after capture. This is a component preview, not an authenticated browser acceptance check.

After restoring the local tool environment, the focused `SiteHeader.test.tsx` suite passed 5/5 and scoped ESLint passed. The earlier startup failures above describe the initial attempt, not the final focused-check result.

## Mobile numbered card buttons — 2026-10-27

The 1–3 result buttons are visually hidden on phones and appear when reached by keyboard focus. Native swipe, position text, and screen-reader access remain in the existing component.

- Web TypeScript `tsc --noEmit -p src/web/tsconfig.json`: passed. `git diff --check`: passed.
- `pnpm build`, `pnpm test`, and `pnpm lint`: started but the local pnpm launcher stalled without output; interrupted. Its temporary lockfile change was restored.
- Direct web Vitest and Vite build: blocked while loading `vite.config.ts` because esbuild reported `Cannot read directory "../../../../..": Access is denied`. Direct ESLint: blocked by missing local `ajv` dependency. Build, test, and lint are therefore unverified in this environment.

## Single-message adjustment notice — 2026-10-27

The visible adjusted-field/count line and `ดูการปรับตัวเลือก` disclosure were removed. The cream notice now contains only the friendly prompt with smaller phone text and shorter vertical padding. Existing result-condition controls still show effective choices; the complete screen-reader status still names every original and replacement value. Previous requirement, plan, design and verification archived under evidence/archive/20261027-single-line-adjustment-notice/.

- Focused ShuffleCards regression: 36/36 passed. Web TypeScript and production build passed; existing Vite large-chunk/dependency-comment warnings remain.
- Changed-file Prettier, `git diff --check`, and wireframe tests (24/24) passed. Direct ESLint could not start because the installed dependency tree lacks `ajv`.
- Local Opera `/meal` at desktop and 390px showed one compact notice without the removed text or disclosure, and no visible horizontal overflow. No production or physical-device check.

## Friendly adjustment notice — 2026-10-27

The adjustment notice now leads with an inviting question on the existing cream/ink/shadow surface, followed by the adjusted field or field count and result count. The old → new values remain in native disclosure; the complete accessible status announcement remains. Previous plan, design and verification archived under evidence/archive/20261027-friendly-adjustment-notice/.

- Focused ShuffleCards tests: 36/36 passed. Web TypeScript and production build passed; Vite retained its existing dependency-annotation and large-chunk warnings.
- Changed-file Prettier, `git diff --check`, and wireframe checks (24/24) passed. Direct ESLint could not start because the installed dependency tree lacks `ajv`.
- Local Opera `/meal` showed the new notice with a stored one-field adjustment at desktop and 390px mobile widths; no visible overflow at the tested widths. Full deployment and physical-device behavior were not verified.

## Compact automatic-adjustment notice — 2026-10-27

Results now show a short adjustment notice with the changed field or field count and the number of matching menus. Native disclosure shows every original → effective value; the complete explanation remains in an assistive status announcement. Previous requirement, plan, design, and verification artifacts archived under evidence/archive/20261027-compact-adjustment-notice/.

- Web TypeScript and Vite production build passed. Vite reported its existing large-chunk and dependency annotation warnings.
- Changed-file Prettier and `git diff --check` passed. Direct ESLint could not start because installed `ajv` is missing.
- Local Opera `/meal` with a stored one-field adjustment showed `ปรับพื้นที่แล้ว เจอ 1 เมนู`; opening `ดูการปรับตัวเลือก` showed `พื้นที่: ตลาดฟ้าไทย → ตรงข้ามมหาวิทยาลัย`. No production verification performed.
- Focused ShuffleCards regression: 36/36 passed, including one-field and multi-field adjustments, disclosure, and restored-session presentation. Wireframe checks: 24/24 passed (prototype checks only).

## Visible menu details button - 2026-10-27

The menu-details action now uses the existing full-width outlined ghost Button and Info icon. Local Opera interaction confirmed that the Dialog opens and closes, focus returns to the button, and card height remains 575.275 px before and after on the tested viewport. Web TypeScript and changed-file Prettier passed. Prior evidence archived under evidence/archive/20261027-visible-menu-details-button/.


## Stable menu-card details - 2026-10-27

Reused Dialog for menu/restaurant details so opening them cannot change the card layout; mobile rail now stretches cards to equal height. Existing usePlaceDetails keeps eager query/cache behavior. Prior plan/design/report archived under evidence/archive/20261027-stable-menu-card-details/.

- Web local tsc -b --pretty false: passed. Vite build --configLoader runner: passed (existing large-chunk and dependency annotation warnings).
- Web vitest run src/pages/meal/ShuffleCards.test.tsx --configLoader runner --maxWorkers 1 --no-file-parallelism: 36/36 passed, including modal outside card, Escape/Close focus return and eager provider requests.
- Web vitest run src/pages/meal/ConfirmMenu.test.tsx --configLoader runner --maxWorkers 1 --no-file-parallelism: 11/11 passed.
- Changed-file Prettier and git diff --check: passed. Impeccable scoped layout detector: []. Wireframe node tests: 24/24 passed (prototype checks only).
- pnpm verify and pnpm format could not start because pnpm package-manager fetch failed. Direct ESLint failed before linting: missing ajv dependency. Repository formatting has existing failures outside changed files; no broad reformat applied.
- Direct API tsc reports existing AbortSignal errors in provider adapters; API tests could not complete successfully in this environment. Initial full web run was interrupted after failures; scoped final results above do not establish a full-suite pass.
- No browser/device geometry or deployed-site validation performed. No commit, push or deployment. Temporary package-manager lockfile changes were removed.


## Balanced compact result buttons — 2026-10-27

Human requested similarly sized buttons without stretching the first button. Changed only the existing result action layout to a content-sized, two equal-column grid; retained outlined buttons, single-line labels, gap-2 and existing responsive typography/touch height. Previous artifacts archived under evidence/archive/20261027-balanced-result-buttons/.

- Existing ShuffleCards tests: 35/35 passed. Web TypeScript/build/ESLint and changed-file Prettier passed; existing >500 kB build warning remains. Scoped Impeccable detector `[]`; `git diff --check` passed.
- Opera local harness with actual ShuffleCardGrid and synthetic menu data: at both 320px and 390px, each button measured 129.41px wide and 48px high. At 320px they shared top 79.375px and each scrollWidth equaled clientWidth (no label clipping). At 390px their combined row measured 266.83px instead of filling the screen. Screenshot: evidence/balanced-result-buttons-mobile.jpg.
- Viewport reset; temporary harness removed and server stopped. No physical-device/deployed-site verification, API change, commit, push or deployment.

## Single-row mobile result actions — 2026-10-27

Human requested keeping the restored outlined Change conditions and Start over buttons on one mobile row. Reused their existing Button instances with non-wrapping layout, phone text-small/px-3, first-button flexible width and second-button natural width. Desktop retains text-body/px-5. Previous artifacts archived under evidence/archive/20261027-single-row-result-buttons/.

- ShuffleCards regression: 35/35 passed. Web TypeScript, production build, ESLint and changed-file Prettier passed; existing >500 kB build warning remains.
- Opera local harness using actual ShuffleCardGrid and synthetic menu data: at 320px both buttons had top 79.375px and height 48px, and scrollWidth equaled clientWidth for each (no label overflow); document width 306px with the scrollbar. At 390px both tops were 79.375px and document width was 390px. At desktop 1440px both tops matched and default 16px text / 20px horizontal padding were restored.
- Synthetic local screenshot: evidence/single-row-result-buttons-mobile.jpg. No physical-device or deployed-site verification. Viewport reset; temporary harness removed and server stopped.
- Scoped Impeccable detector returned `[]`; `git diff --check` passed. No new tests mirroring CSS, API changes, commit, push or deployment.

## Restore original result buttons — 2026-10-27

Human requested original outlined buttons for Change conditions and Start over. Removed compact/borderless overrides from the existing Button instances and restored gap-2 wrapping. Immediate results and compact condition edits remain unchanged. Prior documents archived under evidence/archive/20261027-restore-result-buttons/.

- ShuffleCards regression: 35/35 passed, including edit/reset and busy behavior.
- Web TypeScript, production build and ESLint: passed. Existing >500 kB chunk warning remains.
- Changed-file Prettier initially requested JSX reflow; applied formatting and reran check successfully.
- Scoped Impeccable detector: exit 0, JSON `[]`; `git diff --check` passed.
- Reused the established outlined Button style; no browser/physical-device rerun, API changes, commit, push or deployment.

## Immediately visible menu results — 2026-10-27

Human approved removing manual card opening. Initial/replacement shortlist transitions now mark menus visible immediately; stored legacy hidden cards and undo snapshots normalize through the existing revealAll helper on read. MenuCard no longer renders a face-down branch; result header omits Reveal all and uses direct-selection guidance. Edit/reset, compact conditions, mobile paging, adjustment metadata, exclusions, undo and confirm-only history remain. Specification/backlog and all five design artifacts synchronized; previous versions archived under evidence/archive/20261027-immediate-results/.

- Full web run: 38 files, 445 passed / 2 failed of 447. Both failures were an omitted `cards` import in the updated confirmation test, not application failures; corrected the import without relaxing assertions. Reran affected ShuffleCards, ConfirmMenu and shortlist-transition suites after that fix and the final legacy-session case: 3 files, 73/73 passed. The earlier 37 passing files cover all other suites; no final single full-run pass is claimed.
- Added explicit legacy-session regression: all stored false reveal flags display immediately, undo restores a visible original menu, and neither path sends a recommendation/history write. Updated existing initial/replacement/paging/Places/favorite/confirmation tests to assert immediate details rather than clicking reveal controls. Existing API exclusions, provider non-blocking behavior and confirm-only writes remain covered.
- Web TypeScript, Vite production build and ESLint passed. Default Prettier check on all ten changed code/test files passed. Build retains the existing >500 kB warning.
- Prototype requirements: 24/24 passed; separate evidence for the standalone reference, not React behavior. No backend change; API suite not repeated.
- Browser: actual ShuffleCardGrid/MenuCard and startShortlist rendered in a temporary local-only Vite/MemoryRouter harness with two synthetic menu items, missing-photo placeholders and no real provider data. Opera 390x844 showed menu titles, prices and choose/reject actions immediately, with no reveal button; DOM confirmed both menus and no page overflow. At 1440x900 both visible menu cards used the desktop grid. Synthetic mobile screenshot: evidence/immediate-results-mobile.jpg. This harness has no-op confirmation/edit callbacks; those behaviors are proven by regressions, not this visual check.
- Scoped Impeccable detector reported one existing MenuCard photo `border-b-2` warning. Retained the approved ink photo separator; no new border style was introduced. `git diff --check` passed. Temporary viewport reset, harness removed and server stopped. No physical-device/live-provider/deployed-site verification, commit, push or deployment.

## Short result-condition controls — 2026-10-27

User requested focusing on the four editable conditions and making them shorter. Only compact ConditionSummary changed: omit repeated visible field labels, keep single-line values with ellipsis, subtle dashed underlines and pencils. Full field/value names remain in aria-label/title and in the existing edit question. The three top actions are unchanged in this follow-up; no removal was confirmed. Previous artifacts archived under evidence/archive/20261027-short-result-conditions/.

- Existing ShuffleCards/MealPage regression: 2 files, 57/57 tests passed.
- Web `tsc -b`, `vite build`, ESLint and default changed-file Prettier: passed. Existing >500 kB build warning remains.
- Local Opera harness using actual ConditionSummary and synthetic long labels: inspected 390px and 320px; four targets remained 44px high with full accessible names. At 390px, navigation height was 88px and document width 390px; desktop 1440px navigation height was 44px. Single-line values and ellipsis visible in the mobile screenshot. Initial screenshot capture timed out; a bounded visual retry succeeded, but screenshot export timed out and no image artifact was saved.
- Scoped Impeccable detector: exit 0, JSON `[]`; `git diff --check` passed. Viewport reset and temporary harness removed/stopped. No physical-device or production verification; no API change, commit, push or deployment.

## Lighter result toolbar and condition controls — 2026-10-27

Human requested reducing the bulky result action/condition blocks shown in a screenshot, particularly on mobile. Reused ShuffleCardGrid, compact ConditionSummary and Button. Only Reveal all remains outlined; secondary actions are compact borderless controls. Four directly editable conditions use borderless two-column phone/four-column sm presentation with full wrapping labels/values. Existing pre-submit summary, actions, busy disabling and accessible names remain unchanged. Previous artifacts archived under evidence/archive/20261027-results-toolbar/.

- Existing ShuffleCards and MealPage regression suites: 2 files, 57/57 tests passed, including direct condition editing, reveal/reset, summary return and busy states. No CSS-mirroring tests added.
- Web TypeScript, production build, ESLint and default Prettier check on both modified components passed. Build retains the existing large-chunk warning. Final responsive spacing adjustment was rechecked with build/lint/format.
- Browser: actual components rendered in a temporary local Vite harness with synthetic three-card data and the screenshot's long condition names. Inspected Opera at 390x844, 320x740 and 1440x900. Conditions had zero border width, full wrapped text and >=44px targets; at 320px all three actions shared one row with height 44px and document width 320px. At 390px document width was 390px. Desktop showed four condition columns. Existing keyboard/edit behavior is covered by regression tests, not by this visual harness's no-op edit callbacks.
- Local synthetic mobile screenshot: evidence/results-toolbar-mobile.png. Temporary viewport override reset, harness files removed and preview stopped. This is responsive browser evidence, not physical touch or deployed-site acceptance.
- Scoped Impeccable detector: exit 0, JSON `[]`. `git diff --check` passed. No API changes, commit, push or deployment.

## Automatic-adjustment wording refinement — 2026-10-27

Human requested shortening and clarifying the automatic-adjustment notice. Reused adjustmentMessage and synchronized its single/multiple-change and rendered/reload assertions with design-system/prototype copy. All original/replacement field labels, server order and matching-result counts remain unchanged. Previous report and affected artifacts are archived under evidence/archive/20261027-adjustment-copy-refinement/.

- Web Vitest, `run --exclude 'dist/**' --maxWorkers=2`: 38 files, 447/447 tests passed, including formatter and rendered/reload notice assertions.
- Web `tsc -b`, ESLint `.` and `vite build`: passed. Build retains dependency annotation and >500 kB chunk warnings.
- Default Prettier check on all three changed TypeScript files: passed. Existing package-wide format baseline is recorded below; unrelated files were not reformatted.
- `node tests/wireframe-requirements.test.cjs`: 24/24 passed.
- Scoped Impeccable detector: exit 0, JSON `[]`; `git diff --check` passed.
- No API changes; API tests were not repeated for this copy-only change. No browser/physical-device or deployed-site verification; no commit, push or deployment.

## Reliable tap/click choice progression — 2026-10-27

Human requested fixing devices that require Next after tapping a condition. ChoiceStep now remembers pointer activation on the existing label and consumes it on the radio click, including label-forwarded clicks with detail 0. Keyboard input and pointer cancellation clear that marker. Existing keyboard Next, saved defaults, values and edit-return are preserved. Previous report archived under evidence/archive/20261027-choice-pointer-fix/verification.md.

- Targeted MealPreferences regression: 13/13 passed, including new mouse/touch/pen zero-detail label clicks on a checked default and cancellation/keyboard reset cases. These are jsdom synthetic input tests, not physical-device evidence.
- Full web regression: 38 files, 447/447 tests passed.
- API rerun with `pnpm --filter api test -- --maxWorkers=1`: 76 files, 614/614 tests passed, including all parallel-run failures. This confirms the suites pass with bounded concurrency; the initial combined verify still failed as recorded below.
- `pnpm verify`: both package typechecks and lint passed. Combined tests stopped at API failures: 599 passed, 4 failed, 11 skipped, plus app.test.ts hook timeout (3 failed files). Failures concern catalog child-process timeout and environment/port-startup assertions with empty stderr. Combined web run was canceled; the standalone full web run above passed. No assertions or timeouts were relaxed.
- `pnpm build`: API and web builds passed; Vite retains the existing >500 kB chunk warning.
- `pnpm format`: failed with style warnings in 160 web / 230 API files, consistent with the prior recorded baseline. Default Prettier check on both changed TypeScript files passed. Unrelated files were not reformatted.
- `node tests/wireframe-requirements.test.cjs`: 24/24 passed.
- Scoped Impeccable detector on ChoiceStep: exit 0, JSON `[]`; `git diff --check` passed.
- Initial sandbox checks could not read a parent directory; permitted checks ran outside the sandbox. pnpm initially failed fetching its pinned version, then resolved 12.4.2. Verification-induced lockfile/generated OpenAPI changes were restored.
- Browser/physical touch and the deployed site were not verified in this change. No commit, push or deployment.

## Compact choices and friendly adjustment notice — 2026-10-27

Scope: approved taste/type list simplification in existing ChoiceStep/TasteStep/FoodTypeStep, plus the human-requested friendly adjustmentMessage wording. Existing option IDs, API/filter semantics, one-taste selection, pointer progression, keyboard explicit Next, edit-return and session boundaries are preserved. Prior design/plan artifacts are archived under `evidence/archive/20261027-choice-disclosure/`.

- Choice regression: added coverage for six initial options with any first and no default selection, disclosure without committing/navigation/recommendation requests, all IDs reachable in API order, keyboard selection with explicit Next, pointer progression, additional answers visibly restored on return/reload, small lists without pointless disclosure, and additional saved defaults.
- Copy regression: existing formatter and rendered/reload tests assert one/multiple changes, original/effective labels, server change order and result count with the friendlier text. The notice's `role=status` remains unchanged.
- Browser: local Vite preview with a temporary same-origin proxy for public production GET data, inspected in Opera desktop and 390x844 viewport. Taste starts with 6 of 9 options, food type 6 of 11; any and both more-options controls are visible. Opening disclosure did not advance or select. Space selected an additional taste without advancing; Next advanced. Pointer selection of an additional food type advanced; Back and a fresh reload showed the additional selected radio with its disclosure open. Viewport override reset. No recommendation POST, confirmation or server mutation was submitted. Preview server stopped; no production deployment tested.
- Scoped Impeccable detector: one run over all three modified choice components, exit 0, JSON `[]`.
- `node tests/wireframe-requirements.test.cjs`: 24/24 passed. This is prototype evidence, separate from React/browser verification.
- `pnpm verify` through Corepack/process-local pinned-pnpm shim: TypeScript and both ESLint packages passed. Parallel tests stopped at four existing API timeout/process-start assertions (610/614 API tests); web was cancelled. No tests were relaxed. Package suites are rerun sequentially with bounded workers below.
- `pnpm format`: exit 1 due existing CRLF endings in 160 web and 230 API files. Both package-wide checks pass with `--end-of-line auto`; changed-code default Prettier check passes. Unrelated files were not reformatted.
- Focused MealPage rerun: 22/22 passed. An initial test harness incorrectly counted radios inside closed native details as visible; assertions now check native open state and the initial group because jsdom role queries include closed-details descendants. Real-browser accessibility snapshots show only six initial radios. The temporary preview first started from the repository root could not find Tailwind's theme; restarting from the web package fixed this without changing configuration files.


## CI test environment follow-up — 2026-10-27

Hosted run `40366222412` at commit `4ab40812d37b6126e174a0ca1e3a0cb1b6658596` confirms the previous workflow repair: evidence validation, dependency installation, Prisma generation and both builds passed. The Test step then failed loading `recommendations.service.test.ts` and `recommendations.performance.test.ts`: importing the Gemini adapter imports config, whose required `DATABASE_URL` and `JWT_SECRET` were absent. The other 74 API suites passed (599 tests); web testing was cancelled and lint was skipped after the failure.

Added `NODE_ENV=test`, a local placeholder database URL and a non-secret JWT value of sufficient length to the workflow's Test step only. No production credentials, migrations, application-code changes or assertion changes are needed.

- Importing `src/config/env.ts` directly in a child process with the required variables removed reproduces both validation errors. Importing with the exact workflow Test environment exits 0.
- Full API suite with the workflow Test environment and two workers: 75/76 files, 613/614 tests passed. Both CI-failing recommendation suites loaded and passed. The unrelated local port-collision startup test again exceeded its 5-second child-process limit with empty stderr. Rerunning both recommendation suites plus the complete environment suite with one worker passed all 3 files / 30 tests, including port-collision startup; assertions and timeouts remain unchanged.
- Workflow YAML parses without errors. Workflow Prettier check and `git diff --check` pass.
- Local checks use Windows/Node 24; hosted Ubuntu/Node 22 success requires a new commit and push. No commit, push or hosted rerun was performed here.

## PR verification workflow repair — 2026-10-26

GitHub Actions run `40362870138` for PR #97 failed before application checks: setup-node requested an npm lockfile in a pnpm workspace, and the design check counted the explanatory star as a second core feature. Updated `.github/workflows/verify.yml` to set up the package.json-pinned pnpm before Node caching, cache `pnpm-lock.yaml`, install with `--frozen-lockfile`, generate Prisma using non-production placeholder URLs, and run the existing pnpm build/test/lint scripts without optional-script bypasses. The core counter now checks only the Core table cell. The prototype boundary check also accepts the existing `Mock Elements That Are Not Requirements` heading.

- Workflow YAML parses without errors; setup order, frozen installation and required pnpm commands were checked.
- All five evidence run blocks passed under Git Bash against a temporary snapshot with Linux line endings, including the 24/24 prototype tests and both agent-frontmatter checks.
- Counter fixtures returned 0, 1 and 2 for zero, one and two core rows; explanatory/description stars were excluded.
- `corepack pnpm --version`: 12.4.2. `corepack pnpm install --frozen-lockfile`: exit 0, dependency resolution skipped. Prisma client generation: exit 0. Workspace lock data remains unchanged.
- Workflow Prettier check with checkout line endings and `git diff --check`: passed.
- Full verification passed API/web TypeScript and ESLint, then stopped at the API port-collision startup test (613/614 API tests; child-process stderr was empty within its 5-second limit); the parallel web run was cancelled. No assertion or timeout was changed.
- `corepack pnpm -r --workspace-concurrency=1 test --maxWorkers=2`: exit 0; API passed all 76 files / 614 tests, including port-collision startup, and web passed all 38 files / 437 tests. Rerun completed after midnight on 2026-10-27.
- `corepack pnpm build` with the process-local shim: exit 0 for both API and web; existing Zod comment-annotation and web chunk-size warnings remain.

Local verification uses Node 24.14.0 on Windows; the workflow retains Node 22 on Ubuntu. The old local pnpm launcher can prepend a duplicate package-manager lock document and resolve nested scripts to pnpm 11. Verification therefore uses Corepack and a temporary process-local pnpm shim; no global configuration, dependency versions or committed lockfile changes are needed. Hosted CI success requires a subsequent push; no commit, push, rerun or deployment was performed here.

## Merge conflict reconciliation — 2026-10-26

Resolved five unmerged web files against approved F22/B27 automatic adjustment, retaining compact cards, carousel focus, direct editing, friendly copy, pending-request protection and inline true-no-match recovery. Effective conditions drive storage, editing and replacements. Reused the existing strict conditions schema; the updated storage test rejects incomplete conditions and extra personal fields.

| Check | Result |
|---|---|
| API Vitest, installed entrypoint | 76 files / 614 tests passed. |
| Final web Vitest, `--exclude 'dist/**' --maxWorkers=2` | 38 files / 437 tests passed. |
| Focused ShuffleCards regression | 35/35 passed. |
| Web TypeScript, `tsc -b src/web --pretty false` | Exit 0. |
| Web Vite production build | Exit 0; existing Zod annotation and chunk-size warnings remain. |
| API build: TypeScript, tsc-alias, OpenAPI generation | Each exited 0; generated OpenAPI matches the staged artifact. |
| Full API and web ESLint | Both exited 0; final changed web files also pass scoped lint. |
| Package-wide Prettier | Default checks flag CRLF endings in 230 API and 163 web files; both pass with `--end-of-line auto`. Changed web files pass default formatting. |
| `node tests/wireframe-requirements.test.cjs` | 24/24 passed. |
| Git conflict and whitespace checks | No unmerged paths or conflict markers; staged and worktree whitespace checks pass. |

The initial full web run passed 435/437: an obsolete closestConditions storage assertion was updated for the approved adjustment contract without relaxing validation, and an unrelated restaurant-image timeout passed on rerun. The final full web run passes all tests. The pnpm launcher failed fetching its package-manager version, so checks used installed tool entrypoints; its incidental lockfile change was reverted. Sandbox-only config/dependency/type errors disappeared on authorized reruns outside the sandbox. No browser/device acceptance, commit, push or deployment occurred. Resolution is staged for human review.

## Status

Structural and scaffold verification run after adding the pnpm web/API workspace and updating pnpm to 12.4.2 on 2026-09-18. Security/compliance review remains pending before implementation is reported complete.

## Required checks

| Check | Command | Result | Evidence |
|---|---|---|---|
| Build | `pnpm verify` | Pass: typecheck, lint, Vitest 4.1.11 infra tests, and package builds all exited 0 | Local run on 2026-09-18 after adding API route composition boundary. |
| Test | `node tests/wireframe-requirements.test.cjs` | Pass: 24 tests, 0 fail, duration 21.515084ms | Local run on 2026-09-18 after adding API route composition boundary. |
| Lint | `pnpm format` | Pass: Prettier check exited 0 for both workspace packages | Local run on 2026-09-18 with pnpm 12.4.2 after package-level `.prettierignore` files were added. |
| Security/compliance checks | TBD | Not run | TBD |

## Manual checks

- General discovery works without unnecessary personalization consent.
- Consent is clear, separate, versioned, and timestamped.
- Declined data is not used for personalization.
- Protected APIs reject unauthorized access.
- Data-subject requests follow the documented process.
- Logs do not expose secrets or unnecessary personal data.

## Sign-off

- CodeTest Agent: Pending
- Date: TBD

## Issue #27 — Shared API foundation

### Scope

- Verification date/time: 2026-09-29 00:02 ICT (`UTC+07:00`)
- Environment: local macOS workspace, Node.js and pnpm versions locked by the repository
- Route under test: `GET /health`
- Database: not used; database health checks are outside issue #27

### Results

| Command | Exit code | Result |
|---|---:|---|
| `pnpm --filter api test` | 0 | Pass: 4 test files, 24 tests passed. Supertest drives the HTTP integration cases without custom server lifecycle helpers. Covers environment parsing and startup failure, CORS allowlisting, health response, request-ID validation and boundaries, response helpers, error envelopes, and recursive log sanitization. |
| `pnpm --filter api typecheck` | 0 | Pass. |
| `pnpm --filter api lint` | 0 | Pass. |
| `pnpm verify` | 0 | Pass: workspace typecheck, lint, tests, and builds completed. API: 4 files/24 tests; web: 1 file/1 test. API OpenAPI generation and web production build completed. |
| `pnpm format` | 0 | Pass: API and web files matched Prettier formatting. |
| `node tests/wireframe-requirements.test.cjs` | 1 | Design-prototype gap outside issue #27: 19 passed and 5 failed. Failures require missing Profile/Admin wireframe navigation and admin CRUD/pagination prototype states. No test or prototype file was changed for this API-foundation issue. |

### Security and privacy checks

- HTTP request logs retain request ID, method, and path while omitting query strings, request bodies, cookies, and authorization headers.
- Logger redaction tests cover password, token, email, raw GPS, and nested email/token fields.
- Unknown errors return `INTERNAL_ERROR` without exposing the thrown message or stack trace.
- `CORS_ALLOWED_ORIGINS` rejects wildcard, empty, path-bearing, and malformed origins; configured origins are normalized and deduplicated.
- Generated `dist/` output remains ignored and no `dist/` file is tracked.

### Known unrelated verification gap

The five wireframe failures are in unmodified prototype areas and do not overlap the files or acceptance criteria for issue #27. They remain visible here instead of being hidden or addressed by changing tests outside this issue's scope.

## Issue #28 — Prisma schema and first migration

### Scope

- Verification date/time: 2026-09-29 00:27 ICT (`UTC+07:00`)
- Environment: local macOS workspace, PostgreSQL 17.11 installed through Homebrew, Prisma 6.19.3
- Databases: isolated local databases `kinraidee_issue28_20260929` and `kinraidee_issue28_verify_20260929`
- Cleanup: both temporary databases were removed and the local PostgreSQL server was stopped after verification
- Seed data: none

### Results

| Command | Exit code | Result |
|---|---:|---|
| `DATABASE_URL=postgresql://aboutblank@localhost:5432/kinraidee_issue28_verify_20260929 pnpm --filter api prisma validate` | 0 | Pass: Prisma schema is valid. |
| `DATABASE_URL=postgresql://aboutblank@localhost:5432/kinraidee_issue28_verify_20260929 pnpm --filter api prisma generate` | 0 | Pass: Prisma Client 6.19.3 generated successfully. |
| `DATABASE_URL=postgresql://aboutblank@localhost:5432/kinraidee_issue28_20260929 pnpm --filter api prisma migrate dev --name init` | 0 | Pass: created and applied migration `20260928172507_init`. |
| `DATABASE_URL=postgresql://aboutblank@localhost:5432/kinraidee_issue28_verify_20260929 pnpm --filter api prisma migrate deploy` | 0 | Pass: the committed migration applied to a separate empty database. |
| `DATABASE_URL=postgresql://aboutblank@localhost:5432/kinraidee_issue28_verify_20260929 pnpm --filter api prisma migrate status` | 0 | Pass: database schema is up to date. |
| `DATABASE_URL=postgresql://aboutblank@localhost:5432/kinraidee_issue28_verify_20260929 pnpm --filter api prisma migrate diff --from-url postgresql://aboutblank@localhost:5432/kinraidee_issue28_verify_20260929 --to-schema-datamodel prisma/schema.prisma --exit-code` | 0 | Pass: no difference detected between the migrated database and Prisma schema. |
| `pnpm --filter api typecheck` | 0 | Pass after Prisma Client generation. |
| `pnpm verify` | 0 | Pass: workspace typecheck, lint, tests, and builds completed. API: 4 files/24 tests; web: 1 file/1 test. |
| `pnpm format` | 0 | Pass: API and web files matched Prettier formatting. |
| `node tests/wireframe-requirements.test.cjs` | 1 | Existing design-prototype gap outside issue #28: 19 passed and 5 failed for missing Profile/Admin prototype states. No prototype or wireframe test was modified. |

### Schema checks

- The migration creates all four approved enums and all eleven approved models.
- Only `Restaurant` and `MenuItem` contain `deletedAt`.
- `Restaurant` physical deletion cascades to `MenuItem`; normal application deletion remains soft deletion through `deletedAt`.
- User deletion cascades favorites, preferences, and recommendation history while setting `AuditLog.actorId` to `null`.
- Preference references use `SetNull`; protected catalog references use the approved `Restrict` rules.
- PostgreSQL metadata inspection confirmed eleven application tables, all four enum definitions, and the expected Cascade/Restrict/SetNull foreign-key actions.
- Forbidden session models and unapproved lifecycle/password/budget fields are absent.
- `AuditLog.before` and `AuditLog.after` use nullable PostgreSQL `JSONB`; no password, JWT, cookie, IP, or user-agent columns were added.

## Issue #29 — Initial administrator seed

### Scope

- Verification date/time: 2026-09-29 02:50 ICT (`UTC+07:00`)
- Environment: local macOS workspace, PostgreSQL 17.11, Prisma 6.19.3, pnpm 12.4.2
- Database: isolated local database `kinraidee_issue29_20260929`
- Cleanup: the temporary database was removed and the local PostgreSQL server was stopped after verification
- Seed data: one test-only administrator; no catalog or regular-user fixture data

### Results

| Command | Exit code | Result |
|---|---:|---|
| `pnpm --filter api exec vitest run prisma/seed.test.ts` | 0 | Pass: 1 file/6 tests covering seed validation, normalization, Argon2id hashing, ADMIN assignment, idempotent upsert key, and safe output. |
| `DATABASE_URL=<test-db> pnpm --filter api prisma migrate deploy` | 0 | Pass: committed initial migration applied to an empty isolated database. |
| `DATABASE_URL=<test-db> SEED_ADMIN_EMAIL=<test-email> SEED_ADMIN_PASSWORD=<test-password> pnpm --filter api prisma db seed` run twice | 0 | Pass: both runs completed and emitted only `Seeded 1 administrator account.` |
| Database inspection after repeated seed | 0 | Pass: one normalized user remained with role `ADMIN`; stored value used the Argon2id format and `argon2.verify` succeeded with the trimmed password. Zone, FoodType, Taste, Restaurant, and MenuItem counts remained zero. |
| `DATABASE_URL=<test-db> pnpm --filter api prisma db seed` without seed credentials | 1 | Expected failure: output identified `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` without printing credential values. |
| `DATABASE_URL=<test-db> pnpm --filter api prisma validate` | 0 | Pass: schema valid using `prisma.config.ts`. |
| `DATABASE_URL=<test-db> pnpm --filter api prisma generate` | 0 | Pass: Prisma Client 6.19.3 generated successfully. |
| `DATABASE_URL=<test-db> pnpm --filter api prisma migrate status` | 0 | Pass: database schema up to date. |
| `pnpm verify` | 0 | Pass: workspace typecheck, lint, tests, and builds completed. API: 5 files/30 tests; web: 1 file/1 test. |
| `pnpm format` | 0 | Pass: API and web files matched Prettier formatting. |
| `git diff --check` | 0 | Pass. |
| `node tests/wireframe-requirements.test.cjs` | 1 | Existing design-prototype gap outside issue #29: 19 passed and 5 failed for missing Profile/Admin prototype states. No prototype or wireframe test was modified. |

### Security and scope checks

- The committed environment example contains empty placeholders only; no administrator credential is committed.
- Password input is trimmed, validated at a minimum of 8 characters, and stored only as an Argon2id hash using the approved environment-backed costs.
- Seed errors and success output omit email, plaintext password, and password hash values.
- Repeated seed execution updates the configured administrator password hash and enforces role `ADMIN` without creating another account.
- No public administrator-creation endpoint, password reset/change flow, regular user, or catalog record was added.

## Issue #31 — Email/password authentication

### Scope

- Verification date/time: 2026-09-29 14:02 ICT (`UTC+07:00`)
- Environment: local macOS workspace, PostgreSQL 17.11, Prisma 6.19.3, pnpm 12.4.2
- Database: isolated local database `kinraidee_issue31_20260929`
- Cleanup: the temporary database was removed and the local PostgreSQL server was stopped after verification
- Routes: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, and `GET /api/auth/me`

### Results

| Command | Exit code | Result |
|---|---:|---|
| `pnpm --filter api exec vitest run src/modules/auth src/lib/authSecurity.test.ts` | 0 | Pass: 6 files/26 tests covering credential validation, Argon2id, JWT claims/expiry/algorithm allowlist, cookie flags, service behavior, HTTP routes, and OpenAPI registration. |
| `DATABASE_URL=<test-db> pnpm --filter api prisma migrate deploy` | 0 | Pass: the committed migration applied to an empty isolated database. |
| `NODE_ENV=test DATABASE_URL=<test-db> JWT_SECRET=<test-secret> CORS_ALLOWED_ORIGINS=http://localhost:5173 pnpm --filter api exec tsx .tmp-issue31-integration.mts` | 0 | Pass: temporary verification script exercised the real Prisma repository and HTTP app. Registration normalized credentials, created one `USER`, stored only an Argon2id hash, omitted password data, and set the approved cookie. Duplicate registration returned 409; unknown-email and wrong-password login returned the same generic 401; login, `/me`, invalid-cookie rejection, and logout passed. The temporary script was removed after the run. |
| `pnpm verify` | 0 | Pass: workspace typecheck, lint, tests, and builds completed. API: 11 files/56 tests; web: 1 file/1 test. API OpenAPI generation and web production build completed. |
| `pnpm format` | 0 | Pass: API and web files matched Prettier formatting. |
| `git diff --check` | 0 | Pass. |
| `node tests/wireframe-requirements.test.cjs` | 1 | Existing design-prototype gap outside issue #31: 19 passed and 5 failed for missing Profile/Admin prototype states. No prototype or wireframe test was modified. |

### Security and scope checks

- Passwords are trimmed and require at least 8 characters consistently in seed, registration, and login validation; no composition rule was added.
- Registration always creates `USER`; strict request validation rejects supplied role fields.
- Passwords use the approved environment-backed Argon2id parameters and never appear in API responses.
- JWTs use `HS256` with an explicit verification allowlist and contain `sub`, `role`, `iat`, and `exp` claims with a 7-day lifetime.
- The `__session` cookie is `HttpOnly`, `SameSite=Lax`, `Path=/`, and `Secure` in production. Logout clears the same cookie scope; Firebase Hosting forwards this reserved cookie name to Cloud Run rewrites.
- Missing, invalid, and expired authentication tokens return the same generic 401 response. Login does not expose whether an email exists and performs a dummy Argon2id verification for unknown emails to reduce timing differences.
- Generated OpenAPI contains all four auth routes, the cookie security scheme, strict credentials, and the 8-character password minimum.
- No session table, refresh token, password reset/change, email verification, OAuth, admin-management flow, or authentication UI was added.

## Issue #40 — Development-only internal image uploads

### Scope

- Verification date/time: 2026-09-29 22:01 ICT (`UTC+07:00`)
- Environment: local macOS workspace, Node.js and pnpm versions locked by the repository
- Routes: `POST /api/uploads/images`, `DELETE /api/uploads/images/:fileName`, and `GET /uploads/:fileName`
- Storage: isolated temporary directories in tests; no uploaded file was committed

### Results

| Command | Exit code | Result |
|---|---:|---|
| `cd src/api && node_modules/.bin/vitest run src/config/env.test.ts src/lib/logger.test.ts src/modules/uploads` | 0 | Pass: 6 files/35 tests covering configuration, startup rejection, log sanitization, DTOs, filesystem storage, MIME detection, route authorization, multipart limits and boundaries, deletion, static serving, and OpenAPI. |
| `src/api/node_modules/.bin/tsc -p src/api/tsconfig.json --noEmit --pretty false` | 0 | Pass. |
| `node_modules/.bin/eslint src/api` | 0 | Pass. |
| `pnpm --filter api openapi:generate` | 0 | Pass: generated OpenAPI contains upload, delete, and static image routes with the multipart binary schema. |
| `pnpm verify` | 0 | Pass: workspace typecheck, lint, tests, and builds completed. API: 15 files/79 tests; web: 1 file/1 test. API OpenAPI generation and web production build completed. |
| `pnpm format` | 0 | Pass: API and web files matched Prettier formatting. |
| `git diff --check` | 0 | Pass. |
| `node tests/wireframe-requirements.test.cjs` | 1 | Existing design-prototype gap outside issue #40: 19 passed and 5 failed for missing Profile/Admin prototype states. No prototype or wireframe test was modified. |

### Security and scope checks

- Upload and delete require authenticated `ADMIN` access before multipart parsing or filesystem work.
- Multer is route-scoped, uses memory storage, accepts exactly one `image` field, and enforces the configured byte limit before service processing.
- JPEG, PNG, and WebP are accepted only when `file-type` detects matching magic bytes; SVG, arbitrary content, empty files, and spoofed MIME declarations are rejected.
- Stored names use `crypto.randomUUID()` plus the detected extension. Original filenames and client path data are never used for storage.
- Delete and static routes accept only generated UUID image names. Traversal, encoded traversal, unknown formats, and manually named files are rejected.
- Local upload startup is rejected in production, upload/delete return `503 UPLOAD_STORAGE_UNAVAILABLE` when disabled, and production does not register static serving.
- Logger sanitization removes filename, file-buffer, and image-content fields recursively. No image-processing or durable-storage dependency was added.

## Issue #39 — Restaurant CRUD endpoints

### Scope

- Verification date/time: 2026-09-29 23:28 ICT (`UTC+07:00`)
- Environment: local macOS workspace, Node.js 26.4.0, pnpm 12.4.2, PostgreSQL 17
- Database: isolated local database `kinraidee_issue39_20260929`
- Cleanup: the temporary database was removed and the local PostgreSQL service was stopped after verification
- Routes: `GET /api/restaurants`, `GET /api/restaurants/:id`, `POST /api/restaurants`, `PATCH /api/restaurants/:id`, `DELETE /api/restaurants/:id`, and `POST /api/restaurants/:id/restore`

### Results

| Command | Exit code | Result |
|---|---:|---|
| `cd src/api && node_modules/.bin/vitest run src/modules/restaurants` | 0 | Pass: 5 files/52 tests covering DTO validation, HTTP(S)-only image URLs, service behavior, repository transactions and concurrent idempotency claims, ADMIN authorization, HTTP responses, and OpenAPI registration. |
| `NODE_ENV=test DATABASE_URL=<test-db> JWT_SECRET=<test-secret> CORS_ALLOWED_ORIGINS=http://localhost:5173 node_modules/.bin/tsx .tmp-issue39-integration.mts` | 0 | Pass: temporary script exercised the real app and Prisma repository. Verified unknown-Zone rejection, duplicate names, search/Zone filtering/pagination, phone trimming, external-image replacement, transactional Restaurant/MenuItem soft deletion, idempotent delete/restore, minimized audit snapshots, and restore without child restoration. The script was removed after the run. |
| `NODE_OPTIONS=--localstorage-file=/tmp/kinraidee-vitest-localstorage pnpm verify` | 0 | Pass: workspace typecheck, lint, tests, and builds completed. API: 34 files/274 tests; web: 6 files/55 tests. API OpenAPI generation and web production build completed. |
| `pnpm verify` without `NODE_OPTIONS` on Node.js 26.4.0 | 1 | Environment-only failure: all 55 web tests failed during cleanup because Node exposed `localStorage` as unavailable without `--localstorage-file`. API tests still passed 34 files/271 tests. The same command passed after supplying the Node storage file above. |
| `pnpm format` | 0 | Pass: API and web files matched Prettier formatting after formatting the five reported Restaurant files. |
| `git diff --check` | 0 | Pass. |
| `node tests/wireframe-requirements.test.cjs` | 1 | Existing design-prototype gap outside issue #39: 19 passed and 5 failed for missing Profile/Admin prototype states. No prototype or wireframe test was modified. |

### Security and scope checks

- Every route requires authenticated `ADMIN` access; anonymous and `USER` requests are rejected before repository mutation.
- API inputs are strict and boundary-validated. Localized names require Thai and English values, phone input is trimmed, external images require HTTP(S) URLs, non-web schemes are rejected, and referenced Zones must exist.
- Mutations and their audit records share one Prisma transaction. Delete uses one timestamp for the Restaurant and currently active child MenuItems; already deleted children retain their original timestamp.
- Repeated and concurrent delete/restore operations use conditional database claims so only the request that changes state updates timestamps or creates an audit record. Restore affects only the Restaurant and never restores child MenuItems.
- Audit snapshots omit phone contact data. Delete audit metadata records only the number of MenuItems newly soft-deleted.
- Manual external `imageUrl` updates clear `imageKey`, preventing an external URL from retaining ownership metadata for a prior internal upload.
- Duplicate Restaurant names remain allowed. Physical deletion, image upload/deletion, MenuItem CRUD, public Restaurant access, and admin UI remain outside issue #39.

## Issue #32 — Authentication pages and protected route guards

### Scope

- Verification date: 2026-09-29 (ICT, `UTC+07:00`)
- Environment: local Windows 11 workspace, Node.js 24.12.0, pnpm 12.4.2 through Corepack, PostgreSQL 17 through the committed Docker Compose service
- Database: isolated local database `kinraidee_verify` with the committed migration and the #29 administrator seed; removed after verification
- Pages: `/login`, `/register`, `/account`, `/admin`; guarded `/account/*` and `/admin/*`; header navigation
- Test tooling: `@testing-library/react`, `@testing-library/dom`, `@testing-library/user-event`, and `jsdom` (approved deviation recorded in `docs/plan.md`)

### Results

| Command | Exit code | Result |
|---|---:|---|
| `pnpm --filter web openapi:generate` | 0 | Pass: `src/web/src/api/openapiTypes.ts` generated from `docs/03-implementation/openapi.json`; all four auth paths are typed. |
| `pnpm verify` | 0 | Pass: workspace typecheck, lint, tests, and builds completed. API: 15 files/79 tests (re-run after rebasing onto issue #40); web: 6 files/55 tests. API OpenAPI generation and web production build completed. |
| `prettier --check --end-of-line auto .` in `src/api` and `src/web` | 0 | Pass. `--end-of-line auto` was needed only because this Windows checkout uses `core.autocrlf=true`; committed files keep LF endings. |
| `git diff --check` | 0 | Pass. |
| `node tests/wireframe-requirements.test.cjs` | 1 | Existing design-prototype gap outside issue #32: 19 passed and 5 failed for missing Profile/Admin prototype states. No prototype or wireframe test was modified. |

Web test coverage (55 tests): safe `returnTo` accepts internal paths and rejects absolute, `javascript:`, protocol-relative, backslash, control-character, and auth-page targets; form schemas trim and mirror the API's 8-character password rule; header shows `เข้าสู่ระบบ`, `บัญชีของฉัน`, or `จัดการระบบ` by role; anonymous `/account/*` and `/admin/*` redirect to `/login?returnTo=…`; `USER` on `/admin/*` lands on `/account` with `บัญชีนี้ไม่มีสิทธิ์จัดการระบบ`; `ADMIN` opens admin routes; authenticated visitors to `/login` go to `/admin` or `/account`; login/register submit through the typed client with `credentials: 'include'`; registration sends no `confirmPassword` or role; duplicate email focuses the email field; invalid credentials show one generic message; logout clears the current user and returns Home; empty submit focuses the first invalid field with `aria-describedby`; the login form works by keyboard; passwords and tokens never reach browser storage; recommendation `sessionStorage` survives the login/register round trip and logout. Two deliberate breakages (removing the admin role check, removing the `//` check) were tried: the first failed the suite; the second was still blocked by the same-origin check, confirming the second safeguard.

### Manual browser checks

Run against the real API and database at 375px and desktop widths:

- Anonymous Home header shows `เข้าสู่ระบบ` linking to `/login?returnTo=%2F`; anonymous `/admin/zones` lands on `/login?returnTo=%2Fadmin%2Fzones`.
- Empty registration shows an error under every field, focuses email, and shows the design-system focus ring.
- Registering a new account creates a `USER` and lands on `/account`; `document.cookie` is empty (the auth cookie is `HttpOnly`) and local/session storage stay empty.
- The new `USER` visiting `/admin` lands on `/account` with the approved message.
- Logout returns Home, the header switches to `เข้าสู่ระบบ`, and `GET /api/auth/me` returns 401.
- Re-registering the same email with different capitalisation shows the duplicate-email field error with focus on email.
- Seeded `ADMIN` login with a wrong password shows the generic focused alert; the correct password honors `returnTo=/admin/zones` and falls back to `/admin` until that page exists. An authenticated `ADMIN` opening `/login` is redirected to `/admin`.

### Security, privacy, and scope checks

- No JWT is read, stored, or handled in JavaScript; the query cache holds only `id`, `email`, and `role`.
- Route guards are UX only; protected API routes still enforce roles server-side.
- `returnTo` accepts only same-origin internal paths and falls back by role.
- The registration page states the approved account-email purpose from the specification's data inventory (LR1): optional account features only, not used for advertising or unrelated disclosure, and anonymous recommendations need no account.
- No auth modal, `/admin/login`, role selector, email-verification wording, password reset/change, profile fields, or user-management links were added.
- Known limitation: the design-system fonts (Nunito, Delius Swash Caps) are declared as Tailwind font tokens but not loaded, so browsers use the declared fallbacks. Loading them from Google Fonts would send visitor IP addresses to a third party and needs a separate decision.

## Issue #33 — Zone CRUD endpoints

### Scope

- Verification date: 2026-09-29 (ICT, `UTC+07:00`)
- Environment: local Windows 11 workspace, Node.js 24.12.0, pnpm 12.4.2, PostgreSQL 17 through the committed Docker Compose service
- Database: isolated local database `kinraidee_verify` with the committed migration and #29 administrator seed; removed after verification
- Routes: `GET /api/zones` (public), `POST /api/zones`, `PATCH /api/zones/:id`, `DELETE /api/zones/:id` (`ADMIN`)
- Shared additions reused by later catalog modules: `shared/validation.ts` (field-level `VALIDATION_ERROR`), `shared/localization.ts`, `shared/errorEnvelope.ts` (now also used by auth OpenAPI), `shared/auditContext.ts`, `shared/recordChanges.ts`, `lib/prismaErrors.ts`, and `modules/audit-logs/audit-logs.repository.ts` (transactional audit writer). Mutations reuse the `requireAdmin` middleware added by issue #40

### Results

| Command | Exit code | Result |
|---|---:|---|
| `pnpm --filter api test` | 0 | Pass: 19 files/126 tests (47 new; re-run after rebasing onto issue #40). Covers DTO trimming, empty/missing localized names, description optional/null/partial, `sortOrder` int32 boundaries, non-integer and string rejection, unknown-field rejection, empty update, empty id; service ordering passthrough, timestamp-free public list, duplicate Thai/English/unknown-column mapping to 409, unknown id 404, unchanged update skipping the write, concurrent delete/update races (P2003 → `ZONE_IN_USE`, P2025 → `ZONE_NOT_FOUND`), blocked delete never calling the repository, unexpected errors rethrown; HTTP routes for public list, anonymous 401 and `USER` 403 on every mutation without reaching the service, `ADMIN` create/update/delete with audit context, field-level 400, and error envelopes; OpenAPI paths, security, and components. |
| `NODE_ENV=test DATABASE_URL=<verify-db> … pnpm exec tsx .tmp-issue33-integration.mts` | 0 | Pass: temporary script drove the real app and Prisma repository. Verified ordering by `sortOrder` then Thai name; `CREATE`/`UPDATE`/`DELETE` audit rows with actor ID, the response `x-request-id`, and before/after snapshots equal to the API responses; duplicate Thai and English names return 409 with the offending field and no audit row; an unchanged update writes no audit row; unknown id returns 404; deleting a zone referenced by a restaurant returns 409 `ZONE_IN_USE` and leaves the zone and audit log unchanged; a successful delete returns 204, sets `UserPreference.zoneId` to `null`, and repeats as 404; anonymous 401 and `USER` 403 on every mutation write no audit row. The script was removed after the run. |
| Deliberate regression checks | — | Removing the admin guard from `POST /api/zones` and removing the in-use check each failed the suite (3 failures), then both were restored. |
| `pnpm verify` | 0 | Pass: API 19 files/126 tests; web 6 files/55 tests; OpenAPI generation and web build completed. Generated OpenAPI adds `/api/zones` and `/api/zones/{id}`; the auth section is unchanged after moving to the shared error-envelope schema. |
| `pnpm --filter web openapi:generate` | 0 | Pass: web types regenerated from the updated contract. |
| `prettier --check --end-of-line auto .` in `src/api` and `src/web` | 0 | Pass. |
| `node tests/wireframe-requirements.test.cjs` | 1 | Existing design-prototype gap outside issue #33: 19 passed and 5 failed. |

### Security and scope checks

- Authorization is server-side: `requireAuth` then `requireAdmin` on every mutation; the audit context also refuses a request without an authenticated user.
- One resource path `/api/zones`; no `/api/admin/zones`.
- Zone stays a hard-delete model without `isActive`, `retiredAt`, or `deletedAt`; restaurants are never reassigned automatically; `ที่ไหนก็ได้` is not stored.
- The mutation and its audit row commit in one transaction; failed mutations and reads write no audit row. Zone snapshots contain no personal data.
- Duplicate-name errors use code `ZONE_NAME_ALREADY_EXISTS` (the issue fixes only the 409 status).

## Issue #35 — FoodType CRUD endpoints

### Scope

- Verification date: 2026-09-29 (ICT, `UTC+07:00`)
- Environment and database: same as issue #33 (`kinraidee_verify`, removed after verification)
- Routes: `GET /api/food-types` (public), `POST /api/food-types`, `PATCH /api/food-types/:id`, `DELETE /api/food-types/:id` (`ADMIN`)
- Shared additions: `shared/iconKey.ts` (icon-key rule shared with #37; decision recorded in `docs/plan.md`) and `shared/duplicateNameError.ts` (now also used by zones, with identical output)

### Results

| Command | Exit code | Result |
|---|---:|---|
| `pnpm --filter api test` | 0 | Pass: 25 files/183 tests (57 new; re-run after rebasing onto issue #40). Covers the icon-key rule (valid keys, trimming, 50-character boundary, empty/whitespace/null to `null`, and rejection of SVG, HTML, URL, data URI, JSON, uppercase, underscore, and malformed keys); duplicate-name field mapping; food-type DTO trimming, empty/missing names, icon validation, `sortOrder` boundaries, unknown fields (including `description`), empty update, and empty id; service ordering, timestamp-free public list, duplicate 409, unknown 404, unchanged update skipping the write, clearing the icon, blocked and raced deletes, and audit context; HTTP routes for public list, anonymous 401 and `USER` 403 without reaching the service, `ADMIN` create/update/delete, blank icon stored as `null`, and SVG icon 400; OpenAPI paths and security. |
| `NODE_ENV=test DATABASE_URL=<verify-db> … pnpm exec tsx .tmp-issue35-integration.mts` | 0 | Pass: temporary script drove the real app and Prisma repository. Verified ordering by `sortOrder` then Thai name; a whitespace icon stored as SQL `NULL`; `CREATE`/`UPDATE`/`DELETE` audit snapshots equal to the API responses; SVG icon 400 and duplicate Thai name 409 with no audit row; clearing the icon with `""`; deleting a food type referenced by a menu item returns 409 `FOOD_TYPE_IN_USE` and changes nothing; a successful delete returns 204 and sets `UserPreference.foodTypeId` to `null`; anonymous 401 and `USER` 403 on every mutation. The script was removed after the run. |
| Deliberate regression checks | — | Removing the admin guard from `PATCH /api/food-types/:id` and removing the in-use check each failed the suite (3 failures), then both were restored. |
| `pnpm verify` | 0 | Pass: API 25 files/183 tests; web 6 files/55 tests; OpenAPI generation and web build completed with `/api/food-types` and `/api/food-types/{id}`. |
| `pnpm --filter web openapi:generate` | 0 | Pass. |
| `prettier --check --end-of-line auto .` in `src/api` and `src/web` | 0 | Pass. |
| `node tests/wireframe-requirements.test.cjs` | 1 | Existing design-prototype gap outside issue #35: 19 passed and 5 failed. |

### Security and scope checks

- Mutations require `ADMIN` server-side; one resource path `/api/food-types`.
- FoodType stays a hard-delete model without `description`, `isActive`, `retiredAt`, or `deletedAt`; menu items are never reassigned automatically; `อะไรก็ได้` is not stored.
- `icon` stores only a validated key; no icon assets or components were added to the API.
- Duplicate-name errors use code `FOOD_TYPE_NAME_ALREADY_EXISTS`.

## Issue #37 — Taste CRUD endpoints

### Scope

- Verification date: 2026-09-29 (ICT, `UTC+07:00`)
- Environment and database: same as issue #33 (`kinraidee_verify`, removed after verification)
- Routes: `GET /api/tastes` (public), `POST /api/tastes`, `PATCH /api/tastes/:id`, `DELETE /api/tastes/:id` (`ADMIN`)
- Icon rule: shared with #35; an empty icon key normalizes to `null` instead of being rejected (approved deviation recorded in `docs/plan.md`)

### Results

| Command | Exit code | Result |
|---|---:|---|
| `pnpm --filter api test` | 0 | Pass: 29 files/222 tests (39 new; re-run after rebasing onto issue #40). Covers taste DTO trimming, empty/missing names, SVG/HTML/URL icon rejection, empty icon to `null`, `sortOrder` boundaries, unknown fields, empty update, and empty id; service ordering, timestamp-free public list, duplicate 409, unknown 404, unchanged update skipping the write, clearing the icon, delete blocked by `MenuItemTaste` links, raced delete (P2003 → `TASTE_IN_USE`), and audit context; HTTP routes for public list, anonymous 401 and `USER` 403 without reaching the service, and `ADMIN` create/update/delete; OpenAPI paths and security. |
| `NODE_ENV=test DATABASE_URL=<verify-db> … pnpm exec tsx .tmp-issue37-integration.mts` | 0 | Pass: temporary script drove the real app and Prisma repository. Verified ordering by `sortOrder` then Thai name; empty icon stored as SQL `NULL`; `CREATE`/`UPDATE`/`DELETE` audit snapshots equal to the API responses; SVG, HTML, and URL icons return 400 on `icon`; duplicate English name 409 with no audit row; deleting a taste linked through `MenuItemTaste` returns 409 `TASTE_IN_USE` with the approved message and leaves the taste, both links, and the audit log unchanged; a successful delete returns 204 and sets `UserPreference.tasteId` to `null`; anonymous 401 and `USER` 403 on every mutation; `/api/zones`, `/api/food-types`, and `/api/tastes` all respond through `createApp()`. The script was removed after the run. |
| Deliberate regression checks | — | Removing the admin guard from `DELETE /api/tastes/:id` and removing the in-use check each failed the suite (3 failures), then both were restored. |
| `pnpm verify` | 0 | Pass: API 29 files/222 tests; web 6 files/55 tests; OpenAPI generation and web build completed with `/api/tastes` and `/api/tastes/{id}`. |
| `pnpm --filter web openapi:generate` | 0 | Pass. |
| `prettier --check --end-of-line auto .` in `src/api` and `src/web` | 0 | Pass. |
| `git diff --check` | 0 | Pass. |
| `node tests/wireframe-requirements.test.cjs` | 1 | Existing design-prototype gap outside issue #37: 19 passed and 5 failed. |

### Security and scope checks

- Mutations require `ADMIN` server-side; one resource path `/api/tastes`.
- Taste stays a hard-delete model; `MenuItemTaste` links are never removed automatically; `อะไรก็ได้` is not stored.
- The API stores only validated icon keys and has no knowledge of React or Phosphor components.
- Duplicate-name errors use code `TASTE_NAME_ALREADY_EXISTS`.

## Issue #34 — Zone management screen

### Scope

- Verification date: 2026-09-30 (ICT, `UTC+07:00`)
- Environment: local Windows 11 workspace, Node.js 24.12.0, pnpm 12.4.2, PostgreSQL 17 through the committed Docker Compose service
- Database: isolated local database `kinraidee_verify` with the committed migrations and the #29 administrator seed; removed after verification
- Route: `/admin/zones` under the `/admin/*` guard from #32, using `GET`, `POST`, `PATCH`, and `DELETE` on `/api/zones` through the typed client
- Shared additions reused by #36 and #38: `components/Dialog.tsx` (modal focus rules), `lib/duplicateNameFields.ts`, a `wide` width for `PageShell`, a `ref` prop on `Button`, and `@phosphor-icons/react` (decisions recorded in `docs/plan.md`)

### Results

| Command | Exit code | Result |
|---|---:|---|
| `pnpm --filter web test` | 0 | Pass: 8 files/85 tests (30 new). Schema tests cover trimming, the flat-to-API body transform, required Thai/English names, empty/decimal/text/out-of-range `sortOrder`, negative and int32 boundary values, the all-or-nothing description pair, form pre-fill, and changed-field detection (including clearing a description to `null`). Page tests cover the ADMIN list with every field, the `ที่ไหนก็ได้` note absent from the table, the empty state, load error with retry, no GPS/coordinate fields, create validation with focus on the first invalid field and `aria-describedby` errors, create through the typed client with list refresh, duplicate-name field errors with focus, a generic save alert, edit pre-fill sending only the changed fields, unchanged edit sending no request, delete confirmation before the request, cancel returning focus to the row action, `ZONE_IN_USE` showing the approved message, and dialog focus, Tab trapping, inert background, and Escape. Anonymous and `USER` access reuse the existing #32 guard tests for `/admin/zones`. |
| Deliberate regression checks | — | Removing list invalidation after mutations failed 3 tests, and removing the Shift+Tab wrap in the dialog failed the keyboard test. Both were restored. |
| `pnpm verify` | 0 | Pass: workspace typecheck, lint, tests (API 34 files/274 tests; web 8 files/85 tests), API build with OpenAPI generation, and web production build. |
| `prettier --check --end-of-line auto .` in `src/api` and `src/web` | 0 | Pass. |
| `git diff --check` | 0 | Pass. |
| `node tests/wireframe-requirements.test.cjs` | 1 | Existing design-prototype gap outside issue #34: 19 passed and 5 failed. |

### Manual browser checks

Run against the real API and database at desktop and 375px widths:

- Anonymous `/admin/zones` redirects to login with `returnTo`; the seeded `ADMIN` returns to `/admin/zones` after login and sees the empty state and the `ที่ไหนก็ได้` note.
- Pressing Enter on an empty create form shows errors under both names and `sortOrder` and focuses the Thai name.
- Creating a zone with both descriptions adds the row to the table.
- Creating a second zone with the same Thai name shows the duplicate-name error from the real API's 409 on the Thai name field.
- Escape closes the dialog, returns focus to `เพิ่มโซน`, and removes `inert` from the page.
- Clearing only one description shows the pair error. Clearing both saves `description: null`, and the table shows `ไม่มี`.
- Deleting a zone used by a restaurant shows the approved `ZONE_IN_USE` message inside the dialog and keeps the row.
- Deleting an unused zone at 375px removes the row, announces the result, and moves focus to `เพิ่มโซน`.
- At 375px the page does not scroll horizontally; only the table scrolls inside its frame, and the dialog opens as a bottom sheet.

### Security and scope checks

- The guard is UX only; every mutation is still authorized by the API's `requireAdmin`.
- Endpoint strings exist only in `hooks/admin/zones/useZones.ts`; components never call the API client.
- No bulk reorder, `ที่ไหนก็ได้` record, GPS/coordinate field, restaurant reassignment UI, or API change was added. Zone data contains no personal data.

## Issue #36 — FoodType management screen

### Scope

- Verification date: 2026-09-30 (ICT, `UTC+07:00`)
- Environment and database: same as issue #34 (`kinraidee_verify`, removed after verification). A test menu item was inserted directly in that database to check `FOOD_TYPE_IN_USE`, because MenuItem CRUD (#42) does not exist yet
- Route: `/admin/food-types` under the `/admin/*` guard from #32, using `GET`, `POST`, `PATCH`, and `DELETE` on `/api/food-types` through the typed client
- Icons: `src/web/src/lib/foodTypeIcons.tsx` registry on the shared `lib/iconRegistry.ts` (key mapping recorded in `docs/plan.md`)
- Shared refactor: the zones page now uses the extracted shared components, schema fields, and test helpers; its behavior and tests are unchanged

### Results

| Command | Exit code | Result |
|---|---:|---|
| `pnpm --filter web test` | 0 | Pass: 12 files/122 tests (37 new). Schema tests cover trimming, the empty icon choice becoming `null`, rejection of keys outside the registry (including SVG markup), the shared name and `sortOrder` rules, pre-fill of known, null, and unknown icon keys, and changed-field detection that leaves an untouched unknown key alone. Icon tests check the exact registry keys, the Phosphor component for each key, and the `ForkKnife` fallback for null, unknown, prototype-property, and SVG keys. A source scan finds no handwritten `<svg>`, `<path>`, `<symbol>`, or `<use>` markup and no namespace import from Phosphor in application code. Page tests cover the ADMIN list with icon labels, the fallback icon and label for null and unknown keys, the `อะไรก็ได้` note absent from the table, the empty state, no description field, a select offering only the registry keys with text labels and the helper connected by `aria-describedby`, create validation and focus, creating without an icon as `null` and with a chosen key, duplicate-name errors, edit pre-fill sending only the changed icon, an unknown key kept on edit, delete confirmation with list refresh and focus fallback, `FOOD_TYPE_IN_USE` with the approved message, and Tab/Escape behavior. |
| Deliberate regression checks | — | Replacing the registry's own-key check with `in`, and comparing the edited icon with the raw stored key, failed 3 tests; both were restored. |
| `pnpm verify` | 0 | Pass: workspace typecheck, lint, tests (API 34 files/274 tests; web 12 files/122 tests), API build with OpenAPI generation, and web production build. |
| `prettier --check --end-of-line auto .` in `src/api` and `src/web` | 0 | Pass. |
| `git diff --check` | 0 | Pass. |

### Manual browser checks

Run against the real API and database at desktop and 375px widths:

- Keyboard-only create: Tab reaches the icon select, ArrowDown changes it, and the preview icon beside the select updates. Saving shows `เส้น` with the steaming-bowl icon in the table.
- Creating without an icon stores `icon: null` (confirmed through `GET /api/food-types`), and the table shows `ไอคอนเริ่มต้น` with the fork-and-knife icon.
- Deleting a food type used by a menu item shows the approved `FOOD_TYPE_IN_USE` message inside the dialog and moves focus to it.
- A key set directly in the database outside the registry (`dumpling`) shows as `ไอคอนเริ่มต้น (ไม่รู้จัก dumpling)`. Editing only `sortOrder` saves `sortOrder: 5`, and the stored `icon` stays `dumpling`.
- Deleting an unused food type removes the row, announces the result, and moves focus to `เพิ่มประเภทอาหาร`.
- At 375px the page does not scroll horizontally.
- After the shared refactor, `/admin/zones` still loads and lists zones.

### Security and scope checks

- Database icon values resolve only through the fixed registry map, and unknown values fall back. No component is imported dynamically from a stored string.
- Endpoint strings exist only in `hooks/admin/food-types/useFoodTypes.ts`. There is no description field, bulk reorder, `อะไรก็ได้` record, MenuItem reassignment UI, icon asset picker, or API change.

## Issue #38 — Taste management screen

### Scope

- Verification date: 2026-09-30 (ICT, `UTC+07:00`)
- Environment and database: same as issue #34 (`kinraidee_verify`, removed after verification). A `MenuItemTaste` link to the test menu item was inserted directly in that database to check `TASTE_IN_USE`, because MenuItem CRUD (#42) does not exist yet
- Route: `/admin/tastes` under the `/admin/*` guard from #32, using `GET`, `POST`, `PATCH`, and `DELETE` on `/api/tastes` through the typed client
- Icons: `src/web/src/lib/tasteIcons.tsx` registry (key mapping recorded in `docs/plan.md`)
- Shared refactor: FoodType and Taste now use the shared icon master-data form, table, and schema; the FoodType tests pass unchanged

### Results

| Command | Exit code | Result |
|---|---:|---|
| `pnpm --filter web test` | 0 | Pass: 15 files/149 tests (27 new). Taste icon tests check the exact registry keys, the Phosphor component for each key, and the `ForkKnife` fallback for null, a food-type key, a prototype property, and SVG markup. Schema tests cover the body transform, the empty icon choice becoming `null`, rejection of keys from another registry, changed-field detection, and an untouched unknown key. Page tests cover the ADMIN list with icon labels, the fallback icon and label for null and unknown keys, the `อะไรก็ได้` note absent from the table, the empty state, no description field, only the taste registry keys offered with the helper connected by `aria-describedby`, create validation and focus, create with a chosen icon and with `null`, list refresh, duplicate-name errors on both names when the API names no field, edit pre-fill sending only the changed icon, delete confirmation with list refresh, `TASTE_IN_USE` with the approved message, and Tab/Escape behavior. The #32 guard tests cover anonymous and `USER` access to `/admin/*`, and the icon-policy scan now includes `tasteIcons.tsx`. |
| Deliberate regression checks | — | Mapping `TASTE_IN_USE` to the wrong code and giving `bowl` the wrong icon each failed a test (2 failures), then both were restored. |
| `pnpm verify` | 0 | Pass: workspace typecheck, lint, tests (API 34 files/274 tests; web 15 files/149 tests), API build with OpenAPI generation, and web production build. |
| `prettier --check --end-of-line auto .` in `src/api` and `src/web` | 0 | Pass. |
| `git diff --check` | 0 | Pass. |
| `node tests/wireframe-requirements.test.cjs` | 1 | Existing design-prototype gap outside issues #34, #36, and #38: 19 passed and 5 failed. |

### Manual browser checks

Run against the real API and database at desktop and 375px widths:

- Keyboard-only create: ArrowDown on the icon select picks `flame`, and the table shows `เปลวไฟ` with the flame icon.
- A second taste with the same Thai name shows the duplicate-name error from the real API's 409, with focus on the Thai name.
- Deleting a taste linked to a menu item shows the approved `TASTE_IN_USE` message inside the dialog and moves focus to it.
- Changing the icon to `heart` by keyboard sends only the icon, and `GET /api/tastes` returns `icon: "heart"` with the other fields unchanged.
- Deleting an unlinked taste removes the row, announces the result, and moves focus to `เพิ่มรสชาติ`.
- At 375px neither `/admin/tastes` nor `/admin/food-types` scrolls horizontally, and the food-types page still lists its records after the shared refactor.

### Security and scope checks

- Stored icon values resolve only through the fixed registry map, and unknown values fall back.
- Endpoint strings exist only in `hooks/admin/tastes/useTastes.ts`. There is no description field, bulk reorder, `อะไรก็ได้` record, MenuItem taste-assignment UI, icon asset picker, or API change.

## Issue #42 — MenuItem admin CRUD and bulk actions

### Scope

- Verification date/time: 2026-09-30 17:32 ICT (`UTC+07:00`)
- Environment: local macOS workspace, Node.js 26.4.0, pnpm 12.4.2, PostgreSQL 17
- Database: isolated local database `kinraidee_issue42_20260930`; removed after verification and PostgreSQL stopped
- Routes: administrator list/detail/create/update/soft-delete/restore plus explicit-ID bulk delete/restore under `/api/menu-items`

### Results

| Command | Exit code | Result |
|---|---:|---|
| `pnpm --filter api exec vitest run src/modules/menu-items` | 0 | Pass: 5 files/65 tests covering DTO boundaries, image key/URL pairing, taste deduplication, service relation rules, transactional Restaurant row locking for create/update, concurrent idempotency claims, authorization on all eight routes, bulk limits, and OpenAPI. |
| `NODE_ENV=test DATABASE_URL=<test-db> JWT_SECRET=<test-secret> CORS_ALLOWED_ORIGINS=http://localhost:5173 node_modules/.bin/tsx .tmp-issue42-integration.mts` | 0 | Pass: temporary script drove the real app and Prisma repository. Verified deleted-Restaurant rejection, create with deduplicated tastes, full taste replacement, filtered pagination, concurrent delete with one audit, repeated restore without duplicate audit, unknown bulk-ID rollback, bulk delete, deleted-Restaurant bulk-restore rejection, successful bulk restore, and one summary audit per bulk mutation. The script was removed after the run. |
| `NODE_OPTIONS=--localstorage-file=/tmp/kinraidee-vitest-localstorage pnpm verify` | 0 | Pass after merging current `main` and resolving review findings: workspace typecheck, lint, tests, and builds completed. API: 39 files/339 tests; web: 15 files/149 tests. OpenAPI generation and the web production build completed. |
| `pnpm format` | 0 | Pass: API and web files matched Prettier formatting. |
| `git diff --check` | 0 | Pass. |
| `node tests/wireframe-requirements.test.cjs` | 1 | Existing design-prototype gap outside issue #42: 19 passed and 5 failed for missing Profile/Admin prototype states. No prototype or wireframe test was modified. |

### Security and scope checks

- All eight endpoints require authenticated `ADMIN` access; anonymous and `USER` requests are rejected before service execution.
- Default listing excludes deleted MenuItems and items under deleted Restaurants. `includeDeleted=true` intentionally includes both.
- Create/update validates an active Restaurant, existing FoodType and Tastes, positive integer price, localized fields, and matching generated local-upload key/URL pairs. External images accept HTTP(S) only and persist `imageKey = null`.
- MenuItem and taste-assignment writes share one transaction with the audit row. Taste updates replace the complete assignment; duplicate taste IDs are normalized before persistence.
- Single and bulk soft-delete/restore operations keep image references and `MenuItemTaste` rows. Conditional database claims prevent repeated or concurrent requests from changing timestamps or writing duplicate audit events.
- Bulk requests accept at most 50 explicit IDs, reject the whole request when any ID is unknown, and reject bulk restore when any owning Restaurant is deleted. One minimized IDs/count audit summary is written per changed bulk operation.
- MenuItem responses and audit snapshots exclude Restaurant phone and image binary data. No public MenuItem endpoint, UI, upload processing, R2 integration, recommendation behavior, price history, or availability model was added.

## Issue #49 — AuditLog review API, admin screen, and retention command

### Scope

- Verification date: 2026-10-01 (ICT, `UTC+07:00`)
- Environment: local macOS workspace, Node.js 26.4.0, pnpm 12.4.2, PostgreSQL 17
- Database: isolated local database `kinraidee_issue49_20260930` with the committed migration
- Route: ADMIN-only `GET /api/audit-logs` and `/admin/audit-logs`
- Retention command: `pnpm --filter api audit-logs:prune`

### Results

| Command                                                                           | Exit code | Result                                                                                                                                                                                                                                                                                                            |
| --------------------------------------------------------------------------------- | --------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Focused AuditLog API and web tests                                                |         0 | Pass: 23 tests cover DTO boundaries, recursive unsafe-key redaction, repository filters/order/pagination, authorization, OpenAPI, exact 180-day threshold, idempotency, command logging/disconnect, admin guard, approved copy, empty/list states, filters, pagination, and keyboard-native expandable snapshots. |
| `NODE_OPTIONS=--localstorage-file=/tmp/kinraidee-vitest-localstorage pnpm verify` |         0 | Pass: typecheck, lint, tests, and builds completed. API: 46 files/358 tests; web: 16 files/153 tests. OpenAPI generation and the web production build completed.                                                                                                                                                  |
| `pnpm format`                                                                     |         0 | Pass: API and web files matched Prettier formatting.                                                                                                                                                                                                                                                              |
| `git diff --check`                                                                |         0 | Pass.                                                                                                                                                                                                                                                                                                             |
| `node tests/wireframe-requirements.test.cjs`                                      |         1 | Existing design-prototype gap outside issue #49: 19 passed and 5 failed for missing Profile/Admin prototype states. No prototype or wireframe test was modified.                                                                                                                                                  |
| Real PostgreSQL prune verification                                                |         0 | Pass: a 181-day row was deleted; rows newer than the 180-day cutoff were retained; a second run logged `deletedCount: 0`. The repository uses strict `createdAt < threshold`, with the exact-threshold boundary covered by unit tests.                                                                            |

### Security and scope checks

- The endpoint requires authenticated `ADMIN` access. Anonymous and `USER` requests are rejected before the service reads AuditLog rows.
- The response selects no User relation or actor email. Recursive case-insensitive sanitization removes IP address and user-agent fields, and replaces values under `password`, `token`, `jwt`, `cookie`, `secret`, or `authorization` keys with `[REDACTED]` before snapshots leave the service.
- Reads do not create audit events. Results sort by `createdAt DESC`, then `id DESC`, and support every approved filter plus pagination metadata.
- The page is read-only, uses the typed OpenAPI client through a TanStack Query hook, and renders snapshots as native keyboard-operable `<details>` elements.
- The prune command deletes only rows strictly older than 180 days, logs only the deleted count as application data, is idempotent, and disconnects Prisma.

### Production deployment blocker

The repository provides the retention command but no production scheduler. Production deployment remains blocked until an approved deployment environment configures and verifies a recurring job that runs `pnpm --filter api audit-logs:prune`. The application audit log is not a Computer Crime Act traffic log and does not satisfy any future LR10 traffic-log duty.

## Issue #30 — Approved catalog starter-data seed

### Scope

- Verification date: 2026-10-05 (ICT, `UTC+07:00`)
- Environment: local macOS workspace, Node.js 26.4.0, pnpm 12.4.2, PostgreSQL 17
- Database: isolated local database `kinraidee_issue30_verify` with the committed migration; removed after verification
- Fixture: 3 zones, 4 food types, 6 tastes, 3 restaurants, 9 menu items, and 22 approved menu-taste links
- Source assets: 3 restaurant logos and 9 menu images supplied and approved by the project owner, organized under `assets/catalog/`

### Results

| Command | Exit code | Result |
|---|---:|---|
| `pnpm --filter api exec vitest run prisma/seed.test.ts prisma/catalog-seed.test.ts` | 0 | Pass: 2 files/19 tests covering the existing administrator seed, full-fixture validation before database access, stable IDs, localized values, relation integrity, prices, sort orders, HTTP(S)-only URL validation, idempotency, exact taste-link synchronization, external image behavior, soft-delete preservation, safe summaries, and credential/PII scans. |
| First `pnpm --filter api prisma db seed` against the isolated database | 0 | Pass: logged one administrator and `47 created, 0 updated, 0 unchanged`; database inspection found 3 Zones, 4 FoodTypes, 6 Tastes, 3 Restaurants, 9 MenuItems, 22 MenuItemTaste rows, and 1 administrator. |
| Second identical `pnpm --filter api prisma db seed` | 0 | Pass: logged `0 created, 0 updated, 47 unchanged`; no duplicate rows were created. |
| Seed after adding one out-of-fixture Zone, one stale taste link, and a `deletedAt` value | 0 | Pass: removed exactly 1 stale link from a fixture-managed menu item, retained 22 approved links, preserved the out-of-fixture Zone, and left the existing Restaurant `deletedAt` non-null. |
| `NODE_OPTIONS=--no-experimental-webstorage pnpm verify` | 0 | Pass after resolving review findings: typecheck, lint, tests, and builds completed. API: 47 files/371 tests; web: 16 files/153 tests. OpenAPI generation and the web production build completed. Node 26's experimental global Web Storage was disabled so jsdom supplies the test storage implementation. |
| `pnpm format` | 0 | Pass: API and web files matched Prettier formatting. |
| `git diff --check` | 0 | Pass. |
| `node tests/wireframe-requirements.test.cjs` | 1 | Existing design-prototype gap outside issue #30: 19 passed and 5 failed for missing Profile/Admin prototype states. No prototype or wireframe test was modified. |
| Post-merge `NODE_OPTIONS=--no-experimental-webstorage pnpm verify` after pulling `main` at `df07b81` | 0 | Pass: typecheck, lint, tests, and builds completed with the merged Restaurant management and font changes. API: 48 files/392 tests; web: 19 files/204 tests. Prisma Client was regenerated after installing the merged lockfile. |
| Post-merge `node tests/wireframe-requirements.test.cjs` | 1 | Existing design-prototype gap outside issue #30: 20 passed and 4 failed for the untranslated header expectation and missing Admin prototype states. No wireframe test was modified. |

### Safety and scope checks

- The complete localized fixture is parsed by Zod before Prisma is instantiated or the transaction begins. Invalid IDs, duplicate IDs, missing localized names, invalid relations, non-positive prices, invalid image URLs, and non-integer sort orders fail before database access.
- The administrator and catalog write in one Prisma transaction. Records are processed in dependency order and upserted by stable CUID-shaped IDs; identical records are skipped so their timestamps remain unchanged.
- Seed-managed Restaurant and MenuItem updates never set `deletedAt`. Catalog records absent from the fixture are not deleted. Only stale `MenuItemTaste` links belonging to fixture-managed menu items are removed to synchronize approved `tasteIds`.
- Every seeded `imageUrl` and `imageKey` is `null`. No network request, upload, R2 integration, image blob, plaintext credential, account email, GPS coordinate, or unnecessary personal data is included.
- Seed output contains aggregate record counts only. The fixture's one phone number is the explicitly approved public restaurant contact used by the catalog schema.

## Restaurant local images (API prerequisite for #41)

### Scope

- Verification date: 2026-10-05 (ICT, `UTC+07:00`)
- Environment: local Windows 11 workspace, Node.js 24.12.0, pnpm 12.4.2, PostgreSQL 17 through the committed Docker Compose service
- Database: isolated local database `kinraidee_verify` with the committed migrations and the #29 administrator seed; removed after verification. Uploads were written to a temporary directory and deleted afterwards
- Change: Restaurant create/update accept `imageKey` with its matching `/uploads/<key>` `imageUrl`, using the image rule shared with MenuItem (`modules/uploads/imageReference.ts`). Decision recorded in `docs/plan.md`

### Results

| Command | Exit code | Result |
|---|---:|---|
| `pnpm --filter api exec vitest run src/modules/uploads src/modules/restaurants src/modules/menu-items` | 0 | Pass: 157 tests. New shared-rule tests cover empty, null, trimmed external, and local values; rejection of non-HTTP schemes, non-generated keys, a key without a URL, a key with a different or external URL, and a local URL without its key; and the create/update column mapping, including clearing the key for an external URL or `null`. Restaurant DTO tests now accept a local key with its matching URL and reject a keyless local URL, a mismatched URL, and a non-generated key. The MenuItem tests pass unchanged. |
| `pnpm --filter api exec vitest run src/modules/uploads` | 0 | Pass: 36 tests; the served-image test now also requires `Cross-Origin-Resource-Policy: cross-origin` on `/uploads/<key>`. |
| Deliberate regression checks | — | Removing the image rule from Restaurant create failed 2 tests, and removing the `/uploads` header override failed the served-image test; both were restored. |
| `node image-fix-check.mjs` (temporary script against the real app and database) | 0 | Pass, 8/8: upload returns its key and `/uploads` URL; create stores the key and URL; the stored URL is served; a mismatched key/URL and a keyless local URL return 400 on the right field; an external URL clears the key; `imageUrl: null` clears both columns; and the upload can then be deleted. The script was removed after the run. |
| `curl -D -` against the real app | 0 | Pass: `/uploads/<key>` returns `Cross-Origin-Resource-Policy: cross-origin`; `/api/zones` still returns `same-origin`. Before the fix, the #41 browser check showed the uploaded preview as broken because the browser blocked the image from the web origin. |
| `pnpm --filter api openapi:generate` and `pnpm --filter web openapi:generate` | 0 | Pass: `CreateRestaurantRequest`/`UpdateRestaurantRequest` gain `imageKey`; `imageUrl` is `string \| null` for both Restaurant and MenuItem (previously `string \| unknown`). |
| `pnpm verify` | 0 | Pass: workspace typecheck, lint, tests (API 47 files/379 tests; web 16 files/153 tests), API build with OpenAPI generation, and web production build. |
| `prettier --check --end-of-line auto .` in `src/api` and `src/web` | 0 | Pass. |
| `git diff --check` | 0 | Pass. |

### Security and scope checks

- Only generated upload file names are accepted as keys, and a key must match its `/uploads/<key>` URL exactly, so a record cannot point at another upload or an arbitrary path.
- External images still require HTTP(S); `javascript:` and other schemes are rejected.
- Soft delete still keeps image references. The API does not delete files on update; #41 owns best-effort cleanup after a successful save.
- Production behavior is unchanged: uploads stay disabled there, and external URLs keep working.
- Only the `/uploads` static route relaxes `Cross-Origin-Resource-Policy`, so other pages can embed those public catalog images; it serves only generated file names and adds no CORS read access. All API responses keep helmet's `same-origin`.

## Issue #41 — Restaurant management screen

### Scope

- Verification date: 2026-10-05 (ICT, `UTC+07:00`)
- Environment and database: same as the Restaurant local-images fix (`kinraidee_verify` with development uploads enabled into a temporary directory; both removed after verification)
- Route: `/admin/restaurants` under the `/admin/*` guard from #32, using the typed client for list/create/update/delete/restore and for image upload/delete
- Depends on the API fix above (Restaurant `imageKey`/`/uploads` support and the `/uploads` resource policy); decisions recorded in `docs/plan.md`

### Results

| Command | Exit code | Result |
|---|---:|---|
| `pnpm --filter web test` | 0 | Pass: 19 files/196 tests (43 new). Schema tests cover trimming, empty phone to `null`, required Zone and names, the description pair, each image mode's API body (none to nulls, URL with `imageKey: null`, upload as key and URL), URL validation (empty, non-URL, `javascript:`, `ftp:`), a required file in upload mode, pre-fill for each stored image source, changed-field detection with the image key and URL sent together, and list query building. File checks cover JPEG/PNG/WebP, rejected types, and the 2 MiB boundary. Page tests cover the list with zone, phone, image, and status; uploaded images resolved against the API origin; pagination from API metadata; search, Zone, and deleted filters in the query with reset to page 1; deleted rows with a text status, restore, and no edit; create validation with focus; external URL submit with `imageKey: null` and preview only after validation; a broken-image fallback; edit pre-fill sending only changes; no upload control in production; the `accept` list and client rejection of GIF and oversized files before any request; upload preview and the saved key/URL with no browser storage or `data:`/`blob:` values; a missing file focusing the file input; cleanup after a failed create; old-image deletion only after a successful update (request order checked); a failed update removing only the new upload and keeping the old preview; external images never sent to deletion; cleanup on cancel and on replacing an unsaved upload; the leave prompt with cleanup, and no prompt without unsaved changes; and delete/restore confirmations with the approved warnings and no image deletion on soft delete. |
| Deliberate regression checks | — | Deleting the old image before saving (2 failures), skipping cleanup after a failed save (2 failures), and showing the upload option in production (1 failure) were each caught, then restored. |
| `pnpm verify` | 0 | Pass: workspace typecheck, lint, tests (API 47 files/379 tests; web 19 files/196 tests), API build with OpenAPI generation, and web production build. Re-run after the review fixes below: web 19 files/202 tests. |
| Production bundle check | — | `src/web/dist` contains the external-URL option but not the local-upload control. |
| `prettier --check --end-of-line auto .` in `src/api` and `src/web` | 0 | Pass. |
| `git diff --check` | 0 | Pass. |
| `node tests/wireframe-requirements.test.cjs` | 1 | Existing design-prototype gap outside #41: 19 passed and 5 failed. |

### Manual browser checks

Run against the real API and database at desktop and 375px widths. The browser pane cannot open the OS file picker, so a generated PNG was placed into the file input with a script; everything after that ran through the app.

- Login with `returnTo` lands on `/admin/restaurants`; the list shows zone, phone, image, status, and pagination.
- Upload mode uploads immediately and announces `อัปโหลดรูปแล้ว`. Before the API fix, the preview was blocked by `Cross-Origin-Resource-Policy: same-origin`; after it, the image loads. Saving stores the generated key and `/uploads/<key>` URL.
- Switching that restaurant to an external URL shows the broken-image fallback for an unreachable URL, saves `imageKey: null`, and deletes the replaced file from disk only after the update.
- Delete shows the menu warning. "Show deleted" lists the restaurant with `ลบแล้ว` and a restore button only, and restore shows the warning that menu items are not restored.
- With an unsaved upload, the browser Back button inside the app shows `ออกจากหน้านี้?`. Leaving deletes the upload. Two full-document unloads during testing left their uploads on disk, as documented in `docs/plan.md`.
- At 375px, the filters first overflowed their card; after the fix every control fits. The page does not scroll horizontally, and the form dialog fits the screen.

### Review follow-up

A review against issues #39, #40, #41, and #42 found three bugs and two weaknesses, all fixed in `fix(web): guard restaurant form closing and paging edge cases (#41)`:

- Closing the form (Cancel or Escape) or leaving through the prompt while a save was in flight discarded the new upload, even if the save then succeeded. The form now reports when it is busy: closing is ignored while busy, and the leave prompt leaves cleanup to the save itself.
- An upload that finished after the user left the page was never discarded. The form now discards an upload that resolves after it unmounts.
- Removing the last row of a later page left the list past its end, showing "ยังไม่มีร้านอาหาร" with "หน้า 2 จาก 1". The page now moves back to the last page and shows loading meanwhile.
- A Zone load failure left an empty Zone select with no explanation. The form now shows an alert and disables saving.
- An unparseable image URL threw while rendering a preview. URL resolution now returns `null`, and the preview shows its fallback.

| Check | Result |
|---|---|
| `pnpm --filter web exec vitest run src/pages/admin/restaurants` | Pass: 27 tests (6 new). Covers Escape and a disabled Cancel during a pending save with no upload deleted, leaving during a pending save without deleting the upload, discarding an upload that resolves after leaving, moving back to page 1 after deleting the only row on page 2, the Zone load alert with saving disabled, and the malformed-URL fallback. |
| Deliberate regression checks | Removing the busy guard, the save-aware leave cleanup, the unmount discard, the page clamp, the Zone alert, and the safe URL resolution each failed its test (1 failure each); all were restored. |
| Browser check (21 restaurants) | Deleting the only restaurant on page 2 returned to page 1 with all 20 rows. The Escape-during-save and Zone-failure cases could not be reproduced against the local API (saves finish too quickly, and stopping the API also stops the session check), so they rely on the automated tests. |

### Security, privacy, and scope checks

- Endpoint strings live only in `hooks/admin/restaurants/`; components never call the API client.
- Images are never converted to base64 or stored in browser storage, external images are never proxied or downloaded, and cleanup messages never show file paths.
- Restaurant phone numbers are business contact data shown only to `ADMIN` users. Soft delete keeps image references, and restore does not restore menu items.
- No R2/production upload, MenuItem CRUD, public Restaurant page, image processing, or background orphan cleanup was added.

## Design-system fonts

### Scope

- Verification date: 2026-10-05 (ICT, `UTC+07:00`)
- Change: Nunito with Noto Sans Thai fallback for body text, buttons, and forms; Delius Swash Caps with Mali fallback for main headings; Nunito for admin headings and record names. Fonts are self-hosted, and the stacks are defined once in `src/web/src/styles.css` (decision recorded in `docs/plan.md`; design rules in `docs/02-design/design-system.md`)

### Results

| Command | Exit code | Result |
|---|---:|---|
| `pnpm --filter web test` | 0 | Pass: 2 new router tests. The `<html>` admin marker is set only while an admin route is shown, is removed after leaving, and is never set for a `USER` redirected away from `/admin`. |
| `pnpm verify` | 0 | Pass: workspace typecheck, lint, tests (API 47 files/379 tests; web 19 files/204 tests, after rebasing onto #41), API build with OpenAPI generation, and web production build. The build emits the font files split by script (Latin, Thai, Vietnamese, Cyrillic), and browsers download only the subsets a page uses. |
| `prettier --check --end-of-line auto .` in `src/api` and `src/web` | 0 | Pass. |

### Manual browser checks (Chrome)

- `/login`: the `Kinraidee` wordmark renders in Delius Swash Caps, the Thai heading `เข้าสู่ระบบ` in Mali, and labels and buttons in Noto Sans Thai.
- `/admin` and `/admin/zones`: page headings and the portaled `เพิ่มโซน` dialog heading render in the body font, while the wordmark keeps Delius Swash Caps.
- No request goes to a third-party font host; font files load from the web app's own origin.

## Issue #43 — MenuItem management screen

### Scope

- Verification date: 2026-10-05 (ICT, `UTC+07:00`)
- Change: `/admin/menu-items` with search, Restaurant/FoodType/Taste/deleted filters, pagination, create and edit with a taste checkbox group and whole-baht price, external URL or development-only local images, single delete and restore, and explicit-ID bulk delete and restore for up to 50 selected items. The #41 image flow moved to shared modules that both screens use (decisions recorded in `docs/plan.md`; design rules in `docs/02-design/design-system.md`). No API change.

### Results

| Command | Exit code | Result |
|---|---:|---|
| `pnpm --filter web test` | 0 | Pass: 23 files/263 tests. New: `MenuItemsPage.test.tsx` (29 tests covering the list, filters, validation, active-Restaurant select, edit blocking, image upload and cleanup order, production build without upload controls, single and bulk delete/restore, selection clearing, and blocked restore), `menuItemSchemas.test.ts` (14), `saveWithImageCleanup.test.ts` (5), `imageFields.test.ts`, and router guard cases for `/admin/menu-items` (anonymous to login with `returnTo`; `USER` to `/account`). Every existing Restaurant test passes unchanged against the shared image modules. |
| `pnpm verify` | 0 | Pass: workspace typecheck, lint, tests (API 48 files/392 tests, after rebasing onto #30; web 23 files/263 tests), API build with OpenAPI generation, and web production build. |
| `prettier --check --end-of-line auto .` in `src/api` and `src/web` | 0 | Pass. |
| Production bundle search for `image-file` | — | No match: the local-upload control is not in the production build. |

### Manual browser checks (Chrome, local API and database)

- Signed in as the local test administrator; throwaway Zone, FoodType, Taste, Restaurant, and 23 MenuItem records were created through the API for the check.
- Created a MenuItem with a real PNG upload: the preview loaded from the API origin and the row showed the thumbnail, tastes, and `฿1,250`.
- Replaced that image while editing: both files existed until saving, and the old file was removed from the upload directory right after the update succeeded.
- Deleted a Restaurant through the API: the filter marked it `(ลบแล้ว)`, its items showed `ลบแล้ว` and `ร้านถูกลบ`, single restore opened a dialog with the blocked warning and a disabled confirm button, and selecting one of its items disabled bulk restore with the warning text.
- Bulk delete of three selected items (two already deleted) reported `ลบเมนูแล้ว 1 รายการ`; bulk restore of that item reported `กู้คืนเมนูแล้ว 1 รายการ`. Selection cleared after each action, and the header checkbox showed a partial state for a partial selection.
- Escape closed a dialog and returned focus to its trigger; no console errors.
- Admin font rule held: the page heading, dialog heading, and item names computed to `Nunito Variable`.
- Follow-up UI change requested by the human reviewer: the MenuItem page uses a `1240px` extra-wide card (other admin pages keep `1120px`), and the image is now the first table column at 80 px, with a same-size `ไม่มีรูป` placeholder. Rechecked in Chrome: the table fits the card without horizontal scrolling, including rows for deleted items.
- Follow-up: clicking a table image opens the full, uncropped image in a lightbox dialog (`components/ImageLightbox.tsx`); a new page test covers opening it, closing with Escape and with `ปิด`, and focus returning to the image. Checked in Chrome with an uploaded image.
- Follow-up: the selection checkbox is now the first column, before the image. Fixed-content columns (image, food type, price, status, actions) shrink to fit and tastes wrap within `11rem`, so spare width goes to the menu and Restaurant names. Row actions use a compact `40px` button size, and `กู้คืน` uses a new faint orange `soft` variant. Rechecked in Chrome: no horizontal scrolling, including deleted rows.
- The first manual pass found the table too wide (the action buttons were cut off). Thai and English names now share one column and short cells no longer wrap, so the table fits the admin shell without horizontal scrolling; at 390 px wide the page has no horizontal overflow and the table scrolls inside its frame.

## Issue #44 — Stateless meal recommendation endpoint

### Scope

- Verification date/time: 2026-10-06 01:09 ICT (`UTC+07:00`)
- Environment: local macOS workspace, Node.js 26.4.0, pnpm 12.4.2, PostgreSQL 17
- Route: public `POST /api/recommendations`
- Database: isolated temporary PostgreSQL database `kinraidee_issue44_verify` with 2 Zones, 6 FoodTypes, 2 Tastes, 500 active plus 1 deleted Restaurant, 514 active plus 1 deleted MenuItem, and 504 MenuItemTaste links. Of the 514 non-deleted MenuItems, 513 belong to active Restaurants.
- Cleanup: the verification script is retained in the repository; its uniquely prefixed fixtures are removed in `finally`. The temporary database, PostgreSQL cluster, and log used for this run were removed after verification.

### Results

| Command | Exit code | Result |
|---|---:|---|
| `pnpm --filter api exec vitest run src/modules/recommendations --reporter verbose` | 0 | Pass: 7 files/35 tests covering strict DTO validation, all budget boundaries, 0/1/2/3/more-than-3 result behavior, count and 500-ID limits, exclusion normalization, master-data validation, Prisma filter shape, soft-delete filters, public response minimization, rationale flags, Restaurant-first diversity, randomization invariants, no-match priority, replacement exhaustion, public route behavior, OpenAPI, and performance. Warm service p95 was 0.15 ms over 30 samples with 500 distinct Restaurants. |
| `NODE_ENV=test DATABASE_URL=<test-db> JWT_SECRET=<test-secret> CORS_ALLOWED_ORIGINS=http://localhost:5173 pnpm --filter api recommendations:verify` | 0 | Pass against real PostgreSQL and HTTP with 500 active Restaurants. Verified every budget boundary, deleted MenuItem exclusion, MenuItems under a deleted Restaurant exclusion, a selected Taste when the MenuItem has additional Taste relations, distinct-Restaurant diversity, rejected/displayed exclusion, unknown master ID rejection, exhausted replacement with `relaxation: null`, Zone-first relaxation, and response redaction. Local first request was 47.1 ms; warm HTTP p95 was 26.21 ms over 30 samples. Deployed-host cold-start timing remains unavailable until a test deployment exists. |
| `NODE_OPTIONS=--localstorage-file=/private/tmp/kinraidee-vitest-localstorage pnpm verify` | 0 | Pass after merging current `origin/main`: workspace typecheck, lint, tests, and builds completed. API: 55 files/427 tests; web: 23 files/264 tests. API build regenerated OpenAPI and web production build completed. |
| `pnpm verify` inside the filesystem sandbox | 1 | Environment-only failure: Supertest could not open `127.0.0.1` (`listen EPERM`). The API suite passed after running the same verification outside the sandbox. |
| `pnpm verify` outside the sandbox without `NODE_OPTIONS` | 1 | Environment-only failure: API passed 55 files/426 tests, while Node.js 26 exposed unavailable experimental Web Storage and all web tests failed during `localStorage.clear()`. The controlled command above passed with the temporary storage file. |
| `pnpm format` | 0 | Pass: API and web files matched Prettier formatting. |
| `pnpm --filter api openapi:generate` and `pnpm --filter web openapi:generate` | 0 | Pass: generated contract and typed web client contain the recommendation request, response, rationale, and relaxation types. |
| `git diff --check` | 0 | Pass. |
| `node tests/wireframe-requirements.test.cjs` | 1 | Existing prototype gap outside #44: 20 passed and 4 failed for the untranslated header expectation and missing Admin prototype states. No prototype or wireframe test was modified. |

### Security, privacy, and scope checks

- The endpoint is public and stateless. It creates no RecommendationSession or history row and performs no database write.
- Conditions and rejected/displayed MenuItem IDs are used only for the current request and are not logged by the module.
- Strict Zod validation rejects unknown selected master IDs, malformed exclusions, invalid counts, extra fields, and exclusion arrays above 500 entries.
- Active MenuItems under active Restaurants are the only candidates. Supplied mandatory filters and normalized exclusions are applied in Prisma before randomization.
- Responses include only card/detail/confirmation fields. They omit image ownership keys, soft-delete fields, timestamps, Restaurant phone, and audit metadata.
- Replacement requests never suggest relaxation. Initial no-match requests change only one condition in the approved Zone, Budget, Taste, FoodType priority.

## Issue #53 — Recommendation condition flow shell

### Scope

- Verification date: 2026-10-06 (ICT, `UTC+07:00`)
- Change:
  - Home becomes the landing hero, using the approved prototype copy.
  - The public `/meal` flow covers budget, taste, food type, and zone, then a condition summary with `สับการ์ดเมนู` disabled until #54.
  - Step and conditions are kept in `sessionStorage` and validated on read.
  - The approved session notice is shown.
  - No recommendation API call.
  - Decisions are recorded in `docs/plan.md`; design rules are in `docs/02-design/design-system.md`.

### Results

| Command | Exit code | Result |
|---|---:|---|
| `pnpm --filter web test` | 0 | Pass: 25 files/290 tests. New: `MealPage.test.tsx` (17) and `recommendationSchemas.test.ts` (9). Coverage is listed below the table. |
| `pnpm verify` | 0 | Pass: workspace typecheck, lint, tests (API 55 files/427 tests; web 25 files/290 tests), API build with OpenAPI generation, and web production build. |
| `prettier --check --end-of-line auto .` in `src/api` and `src/web` | 0 | Pass. |

`MealPage.test.tsx` covers:
- Anonymous entry from Home.
- Field-level errors on all four steps, linked with `aria-describedby` and focused.
- Approved budget labels with no default.
- Master data from `/api/tastes`, `/api/food-types`, and `/api/zones` in API order, with the fallback icon for an unknown key.
- `อะไรก็ได้` / `ที่ไหนก็ได้` stored as `null`.
- Summary labels, editing an answer from the summary, back navigation, and retry after a load failure.
- State kept across route changes and through the header login round trip.
- Storage limited to the one key `{ step, conditions }`, with malformed or extra-key storage reset.
- A deleted stored choice sends the user back to that step.
- No `/api/recommendations` request.
- No GPS, allergy, voting, wait-time, card, favorite, or history controls.
- Arrow-key radio selection, and focus moving to each new step heading.

Deliberate regression checks confirmed that the page and schema tests fail when:
- "any" is not mapped to `null`.
- The field-level error is removed.
- The storage whitelist (`.strict()`) is removed.
- The stored flow is not restored.

### Manual browser checks (Chrome, local API with the approved #30 catalog seed)

- **Anonymous run from Home through the summary:**
  - Steps load the seeded tastes (with icons), food types, and zones.
  - Pressing `ถัดไป` with nothing chosen shows `กรุณาเลือกงบประมาณ`.
  - The selected chip uses the yellow fill.
  - The summary lists `฿50–100`, `เผ็ด`, `อะไรก็ได้`, and `ตลาดฟ้าไทย`, with `สับการ์ดเมนู` disabled.
- **Storage:** `sessionStorage` held only `kinraidee:recommendation`, with `{ step, conditions }` and `foodTypeId: null`. The app wrote nothing to `localStorage`.
- **Login round trip:** the header `เข้าสู่ระบบ` went to `/login?returnTo=%2Fmeal`, and after login the page returned to `/meal` at the summary with every answer intact.
- **Keyboard:** Tab and Enter reach `แก้ไข`; arrow keys move the radio selection; the chip focus ring is visible; focus moves to each new step heading.
- **Fonts:** headings use `Delius Swash Caps` (Mali for Thai) and choices use `Nunito Variable`.
- **Width:** at 390 px there is no horizontal overflow on `/` or `/meal`.
- **Console:** no errors.
- **Fixed during the check:** the first pass found the Home heading's Thai tone mark touching the line above, caused by `leading-none`. It now uses `leading-tight`.
- **Follow-up UI changes requested by the human reviewer:**
  - The Home heading has more room above it (`leading-snug` plus top padding), so its tone marks clear the eyebrow text.
  - Every step now uses one shared footer (`StepFooter`), with a divider and more space above `ย้อนกลับ` / `ถัดไป`.
  - The choices area has a shared minimum height. Rechecked in Chrome: the `ถัดไป` button sits at the same position on all four steps. The summary uses the same footer layout, lower down because its answer list is taller.
  - No horizontal overflow at 390 px.

## Issue #54 — Shuffle cards and recommendation interaction

### Scope

- Verification date: 2026-10-06 (ICT, `UTC+07:00`)
- Branch: stacked on #53 (`feat/53-recommendation-conditions`, PR #80).
- Change:
  - `สับการ์ดเมนู` calls `POST /api/recommendations`.
  - Up to three face-down cards, with individual reveal and `เปิดทั้งหมด`.
  - Rejecting a card asks for a one-card replacement in the same slot. If nothing is left, the slot shows `ไม่มีตัวเลือกเพิ่มแล้ว`.
  - One-step `เลิกทำ`.
  - The structured no-match relaxation.
  - Localized rationale.
  - The displayed shortlist, reveal state, rejected IDs, and undo record kept in `sessionStorage`.
  - `เลือกเมนูนี้` is held disabled until #55 adds confirmation.
- Decisions are recorded in `docs/plan.md`; card states are in `docs/02-design/design-system.md`.

### Results

| Command | Exit code | Result |
|---|---:|---|
| `pnpm --filter web test` | 0 | Pass: 28 files/321 tests. New: `ShuffleCards.test.tsx` (18), `shortlist.test.ts` (12), and `formatPrice.test.ts` (1). The issue's required tests are listed below the table. The existing #53 tests are updated for the now-enabled shuffle button. |
| `pnpm verify` | 0 | Pass: workspace typecheck, lint, tests (API 55 files/427 tests; web 28 files/321 tests), API build with OpenAPI generation, and web production build. |
| `prettier --check --end-of-line auto .` in `src/api` and `src/web` | 0 | Pass. |

`ShuffleCards.test.tsx` covers every required test in the issue:
- The initial request body.
- The face-down first view.
- Reveal without an API call, and `เปิดทั้งหมด`.
- Fewer than three results.
- The replacement body (rejected and displayed IDs).
- A same-slot face-down replacement, and `ไม่มีตัวเลือกเพิ่มแล้ว` without relaxation.
- Undo, restoring the card, its slot, reveal state, and rejected IDs.
- A failed replacement leaves everything unchanged.
- A no-match relaxation changes exactly one field, and `relaxation: null` offers only manual editing.
- Manual editing keeps every selection.
- Loading and no-match live regions.
- `motion-safe:`-only animation.
- Text-named card states.
- The session allowlist and restore after a reload.
- Editing conditions clears the shortlist.
- No history or detail endpoints are called.
- A signed-in user gets the same flow.

Deliberate regression checks confirmed the tests fail when:
- The rejected card is also sent as displayed.
- Undo keeps the rejected ID.
- A relaxation changes a second field.
- `เปิดทั้งหมด` reveals nothing.

### Manual browser checks (Chrome, local API with the approved #30 catalog)

- **Anonymous shuffle and reveal:**
  - The shuffle showed three face-down cards.
  - Revealing card 1 showed restaurant, zone, food type, price, tastes, and rationale, and made no API call (still one `POST`).
- **Reject and undo:**
  - Rejecting the card put a face-down replacement in slot 1 and focused it, and the undo bar appeared.
  - `เลิกทำ` restored the original revealed card in slot 1, emptied the rejected list, and made no request.
- **No-match and exhausted slot** (`ไม่เกิน ฿50` + `เผ็ด` + `ตรงข้ามมหาวิทยาลัย`):
  - The no-match panel offered `ถ้าเปลี่ยนงบประมาณจาก “ไม่เกิน ฿50” เป็น “฿50–100” จะพบ 1 เมนู`.
  - Applying it changed only the budget, and exactly one card was shown with no placeholders.
  - Rejecting that card showed `ไม่มีตัวเลือกเพิ่มแล้ว` with no relaxation.
- **Storage:** `sessionStorage` held only `step`, `conditions`, and `shortlist` (`slots`, `rejectedMenuItemIds`, `undo`). The shortlist survived a reload.
- **Motion:** the built CSS defines the reveal animation only inside `@media (prefers-reduced-motion: no-preference)`.
- **Layout and console:** at 390 px there was no horizontal overflow, and the console showed no errors.
- **Browser-tool artifact:** clicking a button by element reference sometimes scrolled the page before the click landed. A native click immediately after a fresh load triggered the shuffle normally, so this is not an app defect.
- **Fixed during the check:** the conditions intro no longer shows above the cards.
- **Follow-up requested by the human reviewer: card photos.**
  - Seven of the approved catalog photos in `assets/catalog/*/menus` (about 1206×1190 px, square) were attached to the matching local menu items, for the check only.
  - Photos now span the card top at 4:3 and are cropped to fill.
  - A card without a photo, or with a broken photo, keeps the same-size panel with the food-type icon.
  - Rechecked in Chrome: the menu names of a photo card, a no-photo card, and a broken-photo card start at the same height, and there is no overflow at 390 px.
  - A new page test covers all three cases. Admin image previews are unchanged.
- **Follow-up requested by the human reviewer: revealed cards ran off screen.**
  - Revealing a card stretched it so far that its actions sat below the fold.
  - The photo is now a `160px` strip instead of `4:3`, and the price sits beside the menu name. A revealed card dropped to about `670px` tall.
  - Revealing, replacing, or restoring a card now scrolls the whole card into view (`block: 'nearest'`), smoothly, or instantly under reduced motion. Focus still moves to the card heading, without its own scroll.
  - Rechecked in Chrome at an `842px`-tall viewport: revealing each of the three cards from the top of the page left the whole card visible, from its top to its last button (`top 173`, `bottom 842`), with focus on the card heading.
  - A new page test checks the scroll target and the reduced-motion behaviour; a deliberate regression check (always smooth) made it fail.
  - `pnpm verify` passes again: API 427 tests, web 28 files/322 tests, and builds.

## Issue #55 — Recommendation confirmation and success

### Scope

- Verification date: 2026-10-06 (ICT, `UTC+07:00`)
- Branch: stacked on #54 (`feat/54-shuffle-cards`, PR #81), which is stacked on #53 (PR #80).
- Change:
  - `เลือกเมนูนี้` on a revealed card opens a two-stage dialog: confirmation (`เอาเมนูนี้แหละ` / `ขอคิดอีกที`), then success (`กลับหน้าหลัก`).
  - `กลับหน้าหลัก` clears the whole flow from `sessionStorage` and returns Home.
  - No history request; #48 owns that.
  - The card photo and rationale list became shared components (`MenuPhoto`, `RationaleList`) used by the card and the dialog. The recommendation test fixtures moved to `src/web/src/test/fakeRecommendationApi.ts`.
- Decisions are recorded in `docs/plan.md`; the dialog stages are in `docs/02-design/design-system.md`.

### Results

| Command | Exit code | Result |
|---|---:|---|
| `pnpm verify` | 0 | Pass: workspace typecheck, lint, tests (API 55 files/427 tests; web 29 files/330 tests), API build with OpenAPI generation, and web production build. |
| `prettier --check --end-of-line auto .` in `src/web` | 0 | Pass. |
| `git diff --check` | 0 | Pass. |

`ConfirmMenu.test.tsx` (10 tests) covers every required test in the issue:
- The dialog shows the chosen card's name, restaurant, zone, price, photo, and rationale, with no wait time and no extra request.
- Missing-photo and broken-photo fallbacks.
- Focus starts in the dialog, Tab and Shift+Tab stay inside it, and the cards behind it are inert.
- `ขอคิดอีกที` and Escape each restore the exact shortlist (a face-down replacement, a revealed card, a face-down card, and the undo bar), leave `sessionStorage` byte-for-byte unchanged, and return focus to the card's `เลือกเมนูนี้`.
- `เอาเมนูนี้แหละ` shows the success state, announces it in a status region, and focuses `กลับหน้าหลัก`, its only action.
- No history request, for anonymous and signed-in users.
- `กลับหน้าหลัก` (and Escape on the success state) returns to `/`, with the recommendation key removed and `sessionStorage` empty.
- The next flow starts at `ข้อ 1 จาก 4` with nothing selected.

The #54 test for the disabled `เลือกเมนูนี้` was removed. The #53 tests for malformed storage now expect the bad value to be removed instead of being rewritten as an empty flow.

Deliberate regression checks confirmed the tests fail when:
- Escape on the success state cancels instead of returning Home.
- `ขอคิดอีกที` also clears the shortlist.
- `finish` neither clears storage nor resets the flow.
- A fresh flow is written to storage instead of removed.

### Manual browser checks (Chrome, local API with the approved #30 catalog)

- **Confirmation:** the dialog showed the chosen card's photo, names, restaurant, zone, price, and rationale. No wait time.
- **Escape:** closed the dialog, returned focus to `เลือกเมนู บรูสเกตตากัวคาโมเล`, left `sessionStorage` identical, and removed every `inert` attribute.
- **Keyboard only:** Enter on the card's button, Tab, Enter confirmed. The success state announced `ขอให้อร่อยกับบรูสเกตตากัวคาโมเล ที่ไอวิชพาสต้า` and focused `กลับหน้าหลัก`. Enter returned to `/` with `sessionStorage` empty.
- **Requests:** only `auth/me`, the three master-data lists, and `POST /api/recommendations`. No history or menu-detail endpoint. No console errors.
- **Layout:** at 390 px the dialog fits without scrolling or horizontal overflow, with `เอาเมนูนี้แหละ` stacked above `ขอคิดอีกที`.

## Issue #46 — MenuItem favorites

### Scope

- Verification date: 2026-10-07 (ICT, `UTC+07:00`)
- Branch: `feat/46-menu-item-favorites`, from `main` after #53–#55 merged.
- Change:
  - API: `GET /api/favorites`, `PUT` / `DELETE /api/favorites/:menuItemId`, and `POST /api/favorites/:menuItemId/toggle`, for any signed-in role, always for the token's user.
  - Web: a heart button on revealed cards and in the confirmation dialog, the login notice for signed-out users, and `/account/favorites`.
  - The OpenAPI document and the generated web client types are regenerated (additions only).
- Decisions are recorded in `docs/plan.md`; the visual rules are in `docs/02-design/design-system.md` (Favorites).
- Process note: work began without plan mode. It was then reviewed against the issue in plan mode, and four corrections were made before this verification:
  - An interrupted regression check had left `useLogout` without its favorites clean-up; it was restored.
  - Adds now use `createMany` with `skipDuplicates`, so simultaneous adds cannot fail on the composite key.
  - A foreign-key failure (the MenuItem vanished mid-request) now returns `404`.
  - Focus now lands on a stable area after the last favorite is removed.
- Follow-up chosen by the human approver: after logging in from the confirmation dialog (or reloading), the dialog reopens. The shortlist stores the chosen card's ID for this.

### Results

| Command | Exit code | Result |
|---|---:|---|
| `pnpm verify` | 0 | Pass: workspace typecheck, lint, tests (API 60 files/459 tests; web 31 files/347 tests), API build with OpenAPI generation, and web production build. |
| `prettier --check --end-of-line auto .` in `src/api` and `src/web` | 0 | Pass. |
| `git diff --check` | 0 | Pass. |

API tests (5 files, 32 tests) cover every required API test:
- `401` on all four routes, with the service never called.
- USER and ADMIN can list, favorite, unfavorite, and toggle their own favorites; a `userId` in the query or body is ignored.
- `PUT` and `DELETE` are idempotent (`ON CONFLICT DO NOTHING` / `deleteMany`), and `toggle` flips in one transaction.
- An unknown MenuItem returns `404` on every route, including the foreign-key race.
- A deleted MenuItem, or one under a deleted Restaurant, cannot be newly favorited (`409 MENU_ITEM_UNAVAILABLE`), but can be unfavorited.
- The list includes unavailable favorites with `available: false` and excludes phone, `imageKey`, and `deletedAt`.
- The OpenAPI document marks every route as cookie-authenticated.

Web tests (`MealFavorites.test.tsx`, 6; `FavoritesPage.test.tsx`, 8) cover every required web test:
- An anonymous heart click goes to `/login?returnTo=%2Fmeal` and announces the notice. The session state is unchanged, login returns to the same cards, and nothing is favorited automatically.
- No password or token is kept in browser storage.
- Signed in, the heart saves with `PUT` and removes with `DELETE`, never `toggle`, and the label and `aria-pressed` follow.
- The saved state is shared between the card and the dialog.
- Logging in from the dialog's heart reopens the same menu's dialog, unsaved, with focus on `ขอคิดอีกที`; closing it returns focus to the card's `เลือกเมนูนี้`.
- An expired session leads to login; a `409` explains that the menu is unavailable.
- The favorites page:
  - Lists newest first with details.
  - Marks an unavailable favorite in text and lets it be removed, with the removal announced and focus kept.
  - Handles a failed removal, an empty state, and an ADMIN account.
  - Redirects anonymous visitors to login.
  - Is linked from the account page.
  - Drops cached favorites on logout.

`ConfirmMenu.test.tsx` is updated: the dialog still opens on `ขอคิดอีกที`, the heart is in the focus trap, and a signed-in user's only extra request is `GET /api/favorites`. A new test reloads with the dialog open, sees it reopen, and checks that `ขอคิดอีกที` removes the stored ID. `shortlist.test.ts` covers `chooseCard`, `chosenItem` (face-down and missing cards never reopen), and `clearChoice`.

Deliberate regression checks confirmed the tests fail when:
- The heart always sends `PUT`.
- The login notice is dropped.
- `aria-pressed` is removed.
- Logout keeps the favorites cache.
- Focus goes to the unmounting list.
- `PUT` skips the availability check.
- The list is oldest first.
- The foreign-key error is not mapped to `404`.
- `Dialog` treats `<body>` as an opener (focus is lost after a reopened dialog closes).
- A face-down card can reopen the dialog.
- `ขอคิดอีกที` leaves a chosen ID behind.

### Manual browser checks (Chrome, local API with the approved #30 catalog)

- **Anonymous:** the hearts carry no `aria-pressed`. Clicking one opened `/login?returnTo=%2Fmeal` with `เข้าสู่ระบบเพื่อบันทึกเมนูโปรด`, and `sessionStorage` was unchanged.
- **Login with the local test account:** returned to `/meal` with the same three revealed cards. Every heart read `บันทึกเป็นเมนูโปรด` / `aria-pressed="false"` (nothing saved automatically), and browser storage held no password or token.
- **Keyboard save:** Enter on a heart turned it into a filled heart on `--ice`, labelled `นำออกจากเมนูโปรด` / `aria-pressed="true"`, and focus stayed on it.
- **Dialog:** showed the same saved state and opened with focus on `ขอคิดอีกที`.
- **API:** the list items contain only `menuItemId`, `createdAt`, `available`, and `menuItem` (`id`, `name`, `price`, `imageUrl`, `restaurant`).
- **`/account/favorites`:** listed the two saved menus newest first.
- **Unavailable:** after the burger was soft-deleted in admin, `PUT` returned `409 MENU_ITEM_UNAVAILABLE` and the page showed the `ไม่พร้อมให้บริการ` badge. Enter on its `นำออกจากเมนูโปรด` (described by the menu name) removed it, announced the removal, and moved focus to the favorites area. The burger was restored afterwards.
- **Layout and console:** at 390 px the rows stack without horizontal overflow, and the console showed no errors.
- **Reopened dialog:** signed out, the heart inside the dialog led to login with the notice and stored only the chosen card's ID. After login the same menu's dialog reopened, unsaved, with focus on `ขอคิดอีกที`. Escape closed it, removed the stored ID, and returned focus to `เลือกเมนู พาสต้าครีมทริปเปิลชีส`. No console errors.

## Issue #47 — Saved default recommendation preferences

### Scope

- Verification date: 2026-10-07 (ICT, `UTC+07:00`)
- Branch: `feat/47-saved-preferences`, stacked on #46 (`feat/46-menu-item-favorites`, PR #84).
- Change:
  - API: `GET`, `PUT`, and `DELETE /api/preferences` for any signed-in role, always for the token's user.
  - Web: `/account/preferences`, and saved defaults pre-selected in the meal flow's condition steps.
  - The OpenAPI document and the generated web client types are regenerated (additions only).
  - `markSignedOut` and `isUnauthenticated` moved to `hooks/auth/useCurrentUser.ts`, shared by favorites and preferences.
  - Follow-up chosen by the human approver: every select starts with `ไม่ตั้งค่า` (not set), and taste, food type, and zone also offer a real saved "any". The API accepts `"ANY"` for those three fields. A migration (`20261007120000_preference_any_choices`) adds `zoneAny`, `foodTypeAny`, and `tasteAny` flags, with check constraints so a flag and an ID are never both set.
- Decisions are recorded in `docs/plan.md` and `docs/03-implementation/data-model.md`; the form rules are in `docs/02-design/design-system.md` (Saved Preferences).

### Results

| Command | Exit code | Result |
|---|---:|---|
| `pnpm verify` | 0 | Pass: workspace typecheck, lint, tests (API 65 files/498 tests; web 34 files/373 tests), API build with OpenAPI generation, and web production build. |
| `prettier --check --end-of-line auto .` in `src/api` and `src/web` | 0 | Pass. |
| `git diff --check` | 0 | Pass. |

| `prisma migrate deploy`, then `prisma migrate diff --from-url … --to-schema-datamodel …` on the local database | 0 | The migration applies, and the database matches the schema exactly. The three check constraints exist. |

API tests (5 files, 39 tests) cover every required API test:
- `401` on all three routes, with the service never called.
- A missing preference returns `preference: null`.
- `PUT` creates, and replaces the complete object (one upserted row per user).
- An all-null object, a partial body, or an unknown budget is rejected.
- Unknown zone, food type, and taste IDs return `400 VALIDATION_ERROR` naming each field, including the foreign-key race.
- Individual fields may be null while one stays set. `"ANY"` is accepted for taste, food type, and zone (even all three), but not for budget. It is stored as the flag with a null ID, read back as `"ANY"`, and never checked as a record.
- `DELETE` removes the row and is idempotent.
- A client `userId` and allergy, health, religion, rejected-ID, or shortlist fields are rejected.
- USER and ADMIN behave alike.
- The OpenAPI document requires all four fields and allows no others.

Web tests (`PreferencesPage.test.tsx`, 13; `MealPreferences.test.tsx`, 6; `preferenceSchemas.test.ts`, 7) cover every required web test:
- **Account page:**
  - The page requires login.
  - The options come from the three master-data APIs: `ไม่ตั้งค่า` first, then `อะไรก็ได้` / `ที่ไหนก็ได้` for taste, food type, and zone (budget has none), then the records.
  - An all-"any" save is valid and sends `"ANY"`, and a saved "any" shows as selected.
  - A saved preference fills the form.
  - Save sends the complete four-field object and announces `บันทึกค่าเริ่มต้นแล้ว`.
  - A save with everything `ไม่ตั้งค่า` shows `เลือกอย่างน้อยหนึ่งค่า หรือกดล้างค่าเริ่มต้น` linked to the budget field, focuses it, and makes no request.
  - The clear button is always shown; with nothing saved it is disabled and described by `ยังไม่ได้ตั้งค่าเริ่มต้น`.
  - Clear runs only after confirmation, announces `ล้างค่าเริ่มต้นแล้ว`, resets the form, and moves focus to `บันทึกค่าเริ่มต้น`.
  - A stale choice is marked on its field, and other failures show an alert.
  - An ADMIN account works the same.
  - The account link reads `ค่าเริ่มต้นการสุ่มเมนู`, and logout drops the cached preference.
  - Browser storage never holds the preference.
- **Meal flow:**
  - Signed in, each saved default is shown and is committed only on `ถัดไป`. A saved "any" pre-selects `อะไรก็ได้` and commits as "any".
  - A field with no default stays unanswered.
  - The user can override a default.
  - An answer the user already gave, including "any", wins.
  - A default whose record no longer exists is dropped, and `ถัดไป` asks for a choice.
  - An anonymous user gets no defaults and no preference request.
- `ConfirmMenu.test.tsx` now also expects a signed-in user's `GET /api/preferences`.

Deliberate regression checks confirmed the tests fail when:
- **API:**
  - It accepts all-null.
  - It accepts extra fields.
  - It skips the ID check.
  - Clear is not idempotent.
- **Web:**
  - The form accepts all-empty.
  - Clear skips the confirmation.
  - Focus is not moved after clearing.
  - A default is stored before `ถัดไป`.
  - A default beats the user's own answer.
  - A null default becomes "any".
  - A stale default is kept.
  - Logout keeps the preference.
- **The "any" follow-up:**
  - The API stores `"ANY"` in the ID column.
  - The API forgets the flag on read.
  - The API checks `"ANY"` as a record.
  - The API accepts `"ANY"` for budget.
  - The page drops the "any" option.
  - "Not set" is sent as `"ANY"`.
  - The flow gets `"ANY"` as an ID.
  - "Not set" becomes "any" in the flow.

Two of these first survived because their tests checked before the preference had loaded; the tests now wait for it. One "any" check first survived because only food type covered "not set"; the unit test now covers all three fields. The tests also caught a real defect: after clearing, focus returned to the clear button just as it was removed. Focus now moves to `บันทึกค่าเริ่มต้น`.

### Manual browser checks (Chrome, local API with the approved #30 catalog)

- **Signed in, `/account/preferences`:** the four labelled selects listed the master data with the "no default" option first.
- **Empty save:** showed the approved message linked to `งบประมาณ`, focused it, and sent no request.
- **Save:** `฿101–200` and a zone sent one `PUT` and announced `บันทึกค่าเริ่มต้นแล้ว`. The API returned exactly the four fields, and browser storage held no preference.
- **Meal flow, fresh session:**
  - The budget step showed `฿101–200` selected, with nothing stored yet.
  - `ถัดไป` committed it.
  - Taste (no default) required a choice.
  - The zone step showed the saved zone. Choosing another zone carried through to the summary, and only the flow's own key was in `sessionStorage`.
- **Clear:**
  - The confirmation opened on `ยกเลิก`, and Escape kept the preference.
  - Confirming deleted it (the API then returned `null`), announced `ล้างค่าเริ่มต้นแล้ว`, reset every select, and focused `บันทึกค่าเริ่มต้น`.
- **Anonymous `/meal`:** nothing pre-selected and no preference request.
- **Not set / any follow-up:**
  - The selects start with `ไม่ตั้งค่า`, then `อะไรก็ได้` / `ที่ไหนก็ได้`.
  - Saving "any" for taste, food type, and zone with budget not set announced `บันทึกค่าเริ่มต้นแล้ว` with no error. The API returned `"ANY"` for the three fields, and the database row held null IDs with all three flags true.
  - In a fresh `/meal`, the budget step had nothing selected. Taste, food type, and zone each pre-selected their "any" chip, and the flow stored them as "any". No console errors.
- **Layout and console:** at 390 px no horizontal overflow, and no console errors.

## Issue #48 — Selected MenuItem history

### Scope

- Verification date: 2026-10-07 (ICT, `UTC+07:00`)
- Branch: `feat/48-selected-history`, stacked on #47 (`feat/47-saved-preferences`, PR #85), which is stacked on #46 (PR #84).
- Change:
  - API: `GET`, `POST`, and `DELETE /api/recommendation-history` for any signed-in role, always for the token's user.
  - Web: a signed-in `เอาเมนูนี้แหละ` records the menu, and `/account/history` lists and clears history.
  - The OpenAPI document and the generated web client types are regenerated (additions only).
  - The MenuItem summary, the availability check, and `MENU_ITEM_UNAVAILABLE` moved from favorites to `src/api/src/modules/menu-items/menu-items.summary.ts`, shared by favorites and history.
  - On the web, favorites and history share `components/MenuSummaryRow.tsx`. Favorites now uses the approved badge `เมนูนี้ไม่พร้อมใช้งานแล้ว`.
- Decisions are recorded in `docs/plan.md`; the page and warning rules are in `docs/02-design/design-system.md` (Selected-Menu History).

### Results

| Command | Exit code | Result |
|---|---:|---|
| `pnpm verify` | 0 | Pass: workspace typecheck, lint, tests (API 70 files/531 tests; web 36 files/387 tests), API build with OpenAPI generation, and web production build. |
| `prettier --check --end-of-line auto .` in `src/api` and `src/web` | 0 | Pass. |
| `git diff --check` | 0 | Pass. |

API tests (5 files, 33 tests) cover every required API test:
- `401` on all three routes, with the service never called.
- POST creates a row for an active MenuItem, returns `409` for a deleted item or one under a deleted Restaurant, and `404` for an unknown item, including the foreign-key race.
- The same MenuItem twice gives two rows.
- GET pages (default 20, at most 100) newest first by `selectedAt` then `id`, and includes unavailable rows with `available: false`.
- No `imageKey`, `deletedAt`, phone, or user ID is returned.
- DELETE clears only the current user's rows and is idempotent.
- A client `userId`, conditions, rejected IDs, or shortlist in the body is a `400`.
- USER and ADMIN behave alike.
- The favorites tests still pass on the shared summary.

Web tests (`MealHistory.test.tsx`, 4; `HistoryPage.test.tsx`, 9; and one new `shortlist.test.ts` case) cover every required web test:
- **Recording:**
  - A signed-in confirmation sends exactly one POST with only `{ menuItemId }`.
  - Revealing, opening the dialog, and `ขอคิดอีกที` send nothing.
  - An anonymous user never calls the history API.
  - A failed write still reaches success, with `เลือกเมนูสำเร็จ แต่บันทึกประวัติไม่สำเร็จ` announced.
  - A reload after confirming shows the success stage and records nothing again.
- **History page:**
  - The page requires login, and rows are newest first, each labelled by its menu.
  - More than 20 rows page with labelled controls (`?page=2&pageSize=20`).
  - The unavailable badge shows, and the empty state has a disabled clear button.
  - Clear-all deletes only after confirmation, then announces `ล้างประวัติแล้ว` and moves focus to the history area. A failed clear keeps the history.
  - ADMIN works the same, the account link works, and logout drops the cache.
- `ConfirmMenu.test.tsx` now expects a signed-in confirmation's single history POST, and the favorites tests use the new badge text.

Deliberate regression checks confirmed the tests fail when:
- POST deduplicates.
- POST skips the availability check.
- POST accepts extra fields.
- DELETE is not scoped to the user.
- The list is oldest first.
- Anonymous users write.
- The write blocks success.
- No warning is shown on failure.
- A reload forgets the confirmation.
- Opening the dialog writes.
- Clear skips the confirmation.
- Focus is not moved after clearing.
- Logout keeps the history cache.

### Manual browser checks (Chrome, local API with the approved #30 catalog)

- **Signed in:** opening the confirmation recorded nothing. `เอาเมนูนี้แหละ` showed the success stage with no warning and recorded exactly one row for the chosen menu.
- **Reload on the success stage:** the success stage came back with focus on `กลับหน้าหลัก`, and still only one row existed.
- **`/account/history` with 23 rows:** 20 rows on page 1, newest first, each labelled by its menu, with `เลือกเมื่อ …` dates and `หน้า 1 จาก 2 · ทั้งหมด 23 รายการ`. Page 2 held the last 3, and a soft-deleted menu showed `เมนูนี้ไม่พร้อมใช้งานแล้ว`; the menu was restored afterwards.
- **Clear all:** the dialog `ล้างประวัติทั้งหมด?` opened on `ยกเลิก` with the approved warning, and Escape kept all 23 rows. Confirming removed every row, announced `ล้างประวัติแล้ว`, showed the empty state with the clear button disabled, and focused the history area.
- **Fixed during the check:** a dialog closed without a focused opener (as in browsers that do not focus buttons on click) now returns focus to the clear button.
- **Anonymous:** confirming reached success with no warning and no history request.
- **Console:** no errors.

## MVP browser-test fixes

### Scope

- Verification date: 2026-10-06 (ICT, `UTC+07:00`)
- Branch: `fix/mvp-ui-polish`, from `main` at `7411978`.
- Source: the end-to-end MVP browser test of `main` as an anonymous visitor, a USER, and an ADMIN. No flow was broken; these are the layout, navigation, and wording issues it found. Web only: no API, OpenAPI, or data-model change.
- Changes:
  - **MenuItem admin table:** food-type names now wrap. At 1280, 1440, and 1920 px the table fits its `1240px` card, which the design system requires, so edit and delete no longer need horizontal scrolling.
  - **Restaurant admin table:** `ไม่มีรูป`, `ใช้งาน`, and `ลบแล้ว` no longer break mid-word.
  - **Header:** ADMIN accounts see `บัญชีของฉัน` beside `จัดการระบบ`, on one row at 375 px.
  - **Dialogs:** they use the opaque `--surface` instead of `--glass`, so page text cannot show through.
  - **Confirmation photo:** now `16:10`, so the dialog fits 1280×800 and 1366×768 without scrolling.
  - **Wording:** the preferences zone select is labelled `พื้นที่`. The meal-page session note is shown only to anonymous users.
  - **Audit log:** action and record types use Thai labels in the table and the filters.
  - **Admin filters:** Restaurant and MenuItem filters live in the URL query (`useUrlFilters`, `lib/urlFilters.ts`), so a reload or a shared link keeps the search, selects, show-deleted, and page.
- Decisions are recorded in `docs/plan.md` and `docs/02-design/design-system.md`.

### Results

| Command | Exit code | Result |
|---|---:|---|
| `pnpm verify` | 0 | Pass: workspace typecheck, lint, tests (API 70 files/531 tests; web 37 files/401 tests), API build with OpenAPI generation, and web production build. |
| `prettier --check --end-of-line auto .` in `src/web` | 0 | Pass. |
| `git diff --check` | 0 | Pass. |

New and updated web tests:
- `lib/urlFilters.test.ts` covers:
  - Defaults and typed reading.
  - Unreadable pages and booleans fall back.
  - Defaults are left out of the URL, and other keys are kept.
  - A round trip.
- The Restaurants and MenuItems page tests:
  - Open from a URL with search, a select, show-deleted, and page 2, and send that query first.
  - Later filter changes are written back to the URL.
- `router.test.tsx`: ADMIN sees both header links.
- `MealPreferences.test.tsx`: the session note is hidden when signed in and shown when signed out.
- The audit-log and preferences tests use the Thai labels.

Deliberate regression checks confirmed the tests fail when:
- The note is shown to a signed-in user.
- The admin header has one link.
- Either page keeps its filters in component state instead of the URL.
- Defaults are written to the URL, or an invalid page is accepted.
- The audit action or record type is shown in English.
- The preferences label goes back to `โซน`.

The table widths and the dialog height are layout rules that jsdom cannot measure, so they were checked in the browser.

### Manual browser checks (local API with the approved #30 catalog)

- **MenuItem table:** `table.scrollWidth` equals the wrapper width at 1280, 1440, and 1920 px (it was 1346 px in a 1184 px box), with the edit and delete buttons in view.
- **Restaurant table:** every image and status label sits on one line, and the table fits.
- **Admin header:**
  - Shows `บัญชีของฉัน` (→ `/account`) and `จัดการระบบ` (→ `/admin`) at 1280 px, on one 70 px row at 375 px, and wrapped without overflow at 320 px.
  - A USER still sees one link, and a signed-out visitor sees `เข้าสู่ระบบ`.
- **Dialogs:** the zone delete dialog's background is `rgb(255, 255, 255)`, and no table text shows through.
- **Confirmation dialog:** no internal scrolling at 1280×800 (690/690) or 1366×768 (680/680). It overflowed by 12 px before.
- **Wording:**
  - Preferences labels read `งบประมาณ`, `รสชาติ`, `ประเภทอาหาร`, `พื้นที่`.
  - The session note is hidden for a signed-in admin and shown again after logout.
- **Audit log:** filters show `โซน`… and `เพิ่ม` / `แก้ไข` / `ลบ` with the same enum values, rows show Thai labels, and filtering by `ลบ` returned only delete rows.
- **Filters in the URL:**
  - A Restaurant search plus show-deleted wrote `?search=…&includeDeleted=true`, with focus kept in the search box, and survived a reload.
  - MenuItems `?page=2` reloaded on page 2.
  - `?page=abc&includeDeleted=yes` fell back to the defaults.
  - `?page=9` moved back to the last page.
- **Phone width:** no horizontal page scroll at 375 px on any changed page.
- **API:** no 5xx responses. The only errors were the expected signed-out session checks and a deliberate duplicate-zone `409`.

## Guaranteed no-match suggestion

### Scope

- Verification date: 2026-10-06 (ICT, `UTC+07:00`)
- Branch: `feat/no-match-suggestion`, from `main`.
- **Change:** `POST /api/recommendations` replaces #54's single-field `relaxation` with `suggestion: { changes, conditions, resultCount }`. It is the fewest filter changes that leave at least one item, and it is `null` only when no active, non-excluded item exists, and for one-card replacements.
- **New module:** the rules live in `src/api/src/modules/recommendations/recommendations.suggestion.ts`, computed in memory from one query of every available item (`findSuggestionPool`). The approved choices:
  - Field priority is zone, budget, taste, food type.
  - Budget moves to the nearest range, up before down.
  - Zone, taste, and food type move to the specific option with the most results.
  - A field the user left as "any" is never changed.
- **Web:** the no-match panel names every change in one sentence, and `ใช้เงื่อนไขนี้แล้วสับใหม่` shuffles with the suggested `conditions`.
- **Regenerated:** the OpenAPI document and the web client types.
- **Docs:** decisions are recorded in `docs/plan.md`, with the contract in `engineering-guidelines.md` and the journey in `user-journey.md`, `prototype.md`, and `diagrams.md`.

### Results

| Command | Exit code | Result |
|---|---:|---|
| `pnpm verify` | 0 | Pass: workspace typecheck, lint, tests (API 71 files/545 tests; web 36 files/385 tests), API build with OpenAPI generation, and web production build. |
| `prettier --check --end-of-line auto .` in `src/api` and `src/web` | 0 | Pass. |
| `git diff --check` | 0 | Pass. |
| `pnpm --filter api recommendations:verify` (local PostgreSQL, 500 Restaurants) | 0 | Pass. The no-match suggestion moves to the fixture zone, and sending its `conditions` back returns items. Warm p95 is 147 ms. |

API tests:
- **`recommendations.suggestion.test.ts`:**
  - Budget bounds and order.
  - `null` only for an empty pool.
  - Zone first when it alone works, then budget, taste, food type.
  - Budget up, down, and from `OVER_200`.
  - Most results, with ties going to display order and then name.
  - Every taste of an item counted.
  - Fields left as any are untouched.
  - A two-field change and a four-field change.
- **Property test:** 300 seeded random catalogs and conditions with no match. Each gets a suggestion whose `conditions` match exactly `resultCount` > 0 items, without changing any "any" field.
- **Other modules:**
  - The service uses the pool with rejected and displayed IDs, stays `null` for replacements, and does not load the pool when items match.
  - The repository select is checked.
  - OpenAPI has `suggestion` and no `relaxation`.
  - The route envelope is checked.
  - A worst-case p95 with 500 items and all four fields changed measured 0.94 ms.

Web tests:
- A single change is explained and shuffles with its `conditions`.
- Three changes are named in one sentence and applied at once.
- `null` keeps the manual-edit-only state.
- `suggestionMessage` joins changes with `และ`.

Deliberate regression checks confirmed the tests fail when:
- Only single changes are tried, so the result is `null` when two are needed.
- The budget only goes up, or tries lower before higher.
- The first option is chosen instead of the one with the most results.
- A tie ignores display order.
- `resultCount` counts the whole pool.
- The pool ignores excluded IDs.
- Replacements get a suggestion.
- The field priority changes.
- The web applies only the first change, or names only the first change.

### Manual checks (local API with the approved #30 catalog)

- **Every combination:** all 1,260 combinations of budget, zone, taste, and food type (including "any") were sent to the live API. 1,122 had no match today. Every one got a suggestion (507 needed more than one change), and sending each suggestion's `conditions` back returned items every time.
- **Examples:**
  - `ไม่เกิน ฿50` + `พาสต้า` + `กรอบ` + `คชพล` previously returned `relaxation: null`. It now suggests budget to `฿50–100` and food type to `อาหารเรียกน้ำย่อยและของทานเล่น`.
  - `มากกว่า ฿200` + `เบอร์เกอร์ แซนด์วิช และแรป` + `สดชื่นและเบา` + `ตลาดฟ้าไทย` now moves the budget down to `฿50–100`.
- **Browser at 1280 px:**
  - The panel read `ถ้าเปลี่ยนงบประมาณจาก “ไม่เกิน ฿50” เป็น “฿50–100” และประเภทอาหารจาก “พาสต้า” เป็น “อาหารเรียกน้ำย่อยและของทานเล่น” จะพบ 1 เมนู`.
  - `ใช้เงื่อนไขนี้แล้วสับใหม่` showed the card with focus on its heading.
  - The stored conditions held both changes and kept the taste and zone.
- **Browser at 375 px:** the message wrapped with no horizontal overflow.

## Seeded catalog photos

### Scope

- Verification date: 2026-10-06 (ICT, `UTC+07:00`)
- Branch: `fix/seed-catalog-photos`, from `main`.
- **Problem:** a fresh clone and seed showed no photos. The 12 committed photos in `assets/catalog/` were never linked, because #30 kept every seeded image `null`.
- **Change:**
  - `catalog.seed.json` gives each of the 3 restaurants and 9 menu items an `image` entry (asset path and fixed key).
  - In development and test, `prisma/seed.ts` copies the photos into the local uploads directory and stores their `/uploads/<key>` URLs.
  - Production behaviour is unchanged.

### Results

| Command | Exit code | Result |
|---|---:|---|
| `pnpm verify` | 0 | Pass (see the PR for test counts). |
| `vitest run prisma` in `src/api` | 0 | Pass: 24 tests. |

New seed tests:
- Every record links to an existing committed photo, and the counts are 3 and 9.
- Records point at `/uploads/<key>` only with local images on, and a second run is unchanged.
- All 12 photos are copied byte-for-byte under their keys.
- A missing photo stops the seed.
- A key with the wrong file type is rejected.

### Manual check (fresh database, as a new contributor)

- A new empty database (`kinraidee_photo_check`) and an empty uploads directory went through `prisma migrate deploy`, then `prisma/seed.ts`:
  - 47 records were created, and 12 photos were copied.
  - 9 menu items and 3 restaurants were linked to `/uploads/...`.
- A second seed run reported 47 unchanged.
- An API started on that database served the Beef Kofta photo with `200 image/png`, 1,482,635 bytes, identical to the committed file.
- The check database and its uploads were removed afterwards.

## Local API environment loading

### Scope

- Verification date/time: 2026-10-06 22:47 ICT (`UTC+07:00`)
- Environment: local macOS workspace, Node.js 26.4.0, pnpm 12.4.2, PostgreSQL 17
- Base: `main` at `a7cd099`
- Change: API development/start and maintenance scripts load optional `src/api/.env` values directly; Prisma config loads the same file before schema evaluation. Shell-specific `source` commands are no longer required.

### Results

| Command | Exit code | Result |
|---|---:|---|
| `pnpm --filter api prisma migrate status` | 0 | Pass without preloading shell variables. Prisma connected to the configured `kinraidee` database and reported both migrations applied. |
| `pnpm --filter api prisma migrate deploy` | 0 | Pass without preloading shell variables; no pending migrations. |
| `pnpm --filter api prisma db seed` | 0 | Pass without preloading shell variables. The administrator was upserted and all 47 catalog records/links were unchanged on the repeated idempotency run. |
| `pnpm dev:api` then `curl -fsS http://localhost:3000/health` | 0 | Pass without preloading shell variables. The API listened on port 3000 and returned `{"data":{"ok":true}}`; the temporary server was stopped after verification. |
| `NODE_OPTIONS=--localstorage-file=/private/tmp/kinraidee-vitest-localstorage pnpm verify` | 0 | Pass: typecheck, lint, tests, and production builds. API: 71 files/545 tests; web: 37 files/399 tests. |
| `pnpm format` | 0 | Pass. |
| `git diff --check` | 0 | Pass. |

### Development logging

- `pnpm dev:api` formats startup and HTTP request logs through `pino-pretty` with ANSI colors, readable local timestamps, and no `pid`/`hostname` noise. A live `GET /api/zones` produced a colored `INFO request completed` entry with the sanitized request, status `200`, and response time.
- `NODE_ENV=production LOCAL_UPLOADS_ENABLED=false node --env-file=.env --import tsx -e "…"` emitted one structured JSON log line, confirming production does not use the pretty transport.
- The full verification suite passed with API logger tests unchanged, confirming test logging remains silent and sensitive-field redaction still applies.

## Navigation and fresh-setup fixes

### Scope

- Verification date/time: 2026-10-07 ICT (`UTC+07:00`)
- Environment: local Windows 11 workspace, pnpm 12.4.2, PostgreSQL in Docker (`kinraidee-postgres`)
- Base: `main` at `9f03bc1`
- Trigger: a teammate's report on a fresh clone. The taste step showed `โหลดตัวเลือกไม่สำเร็จ`, menus showed `ไม่มีรูปเมนู`, and there was no obvious way back Home from the cards or `บัญชีของฉัน`.

### Reproduction on a clean clone

- A temporary worktree of `main` followed `first-setup.md` exactly: `.env.example` copied, `pnpm install --frozen-lockfile`, `prisma migrate deploy`, and `prisma db seed` into a new database. The seed reported `Copied 12 catalog photos into local uploads.`, all 12 `/uploads/<key>` URLs returned `200`, and the cards rendered the photo.
- With an older `pnpm dev` still running, the new API logged `Kinraidee API listening` and then exited, because Express 5 passes `EADDRINUSE` to the listen callback. Vite moved to `5174`. The API sent no `Access-Control-Allow-Origin` for `http://localhost:5174`, so the first API-backed step (taste) failed with `โหลดตัวเลือกไม่สำเร็จ`.
- A seed run with local uploads off (`Local uploads are off, so catalog photos were not attached.`) left 0 menus with photos; re-running the normal seed restored 9 menus with photos without creating records.

### Results

| Check | Result |
|---|---|
| API startup with its port taken | Exits non-zero with `EADDRINUSE`; never logs `Kinraidee API listening` (new test in `src/config/env.test.ts`). |
| `vite` with 5173 taken | Stops with `Port 5173 is already in use` instead of moving ports. |
| Header home link | Hidden on Home; `หน้าแรก` on other pages links `/`; admin keeps `/account` and `/admin` (new `SiteHeader.test.tsx`). |
| Account page | `กลับหน้าแรก` links `/`. |
| Cards `เริ่มใหม่` | Shows question 1 with no answer checked and removes the stored flow (new test in `ShuffleCards.test.tsx`); live browser run matched. |
| Phone width | At 375 px the anonymous header shows the icon-only home link and `เข้าสู่ระบบ` on one row; an admin's three links fit one row at 44 px height; at 320 px they wrap without horizontal scroll. |
| Deliberate regressions | Hiding the home link, showing it on Home, removing `กลับหน้าแรก`, and making `เริ่มใหม่` keep the stored flow each fail the new tests; files restored. |
| `pnpm verify` | Pass. API: 71 files/551 tests; web: 38 files/404 tests; builds pass. One earlier run failed `router.test.tsx` › `marks the document as the admin area only while an admin route is shown`; it passed in 8 repeated file runs and the final full run, so it is recorded as an intermittent test, not a defect in this change. |
| Prettier `--end-of-line auto` and `git diff --check` | Pass for changed code; `user-journey.md` and `plan.md` keep their existing table formatting warnings from `main`. |

## Catalog source format and first restaurant

### Scope

- Verification date: 2026-10-22 ICT (`UTC+07:00`)
- Environment: local Windows 11 workspace, pnpm 12.4.2
- Base: `main` at `76efd97`
- Change: per-restaurant catalog source (`src/api/prisma/data/catalog/`), `catalog:build`, expanded taxonomy with hidden `desserts` and `drinks`, the archived starter catalog, and Family Kebab Halal (29 menu items) from Grab screenshots.

### Results

| Check | Result |
|---|---|
| `pnpm --filter api catalog:build` | Pass: 1 restaurant, 29 menu items, 0 hidden; 29 photos missing, all listed in `photo-checklist.csv`. Before the two items Grab showed as unavailable were removed, the build refused to run with their open review notes, and `--draft` built them with the notes reported. |
| `catalog:build --check` | Pass when in sync; a test writes a stale seed and the check fails with `catalog.seed.json is out of date`. |
| Screenshot handling | Duplicates merged: Hummus and the vegetarian pizza (Top picks and their sections) and the item split across screenshots 7 and 8. Dishes Grab showed with a shared photo but different names and prices were kept separately. Left out as incomplete: the two unavailable Iskender kebabs, the cut-off first item of `อาหารทานเล่น`, and the Top-pick items with no menu entry in the screenshots (Chicken Pitta Doner Kebab, beef fried rice). No Grab photo or description was stored. |
| New build tests (17) | Slug-derived IDs and image keys, nesting flattened into the existing seed shape, hidden food types and all-hidden restaurants left out, photos found by name in any of the three formats, unmatched photos reported, missing-photo paths listed, every validation problem named by file and field, review notes blocking the build, duplicate slugs, CSV quoting with a UTF-8 BOM, unchanged taxonomy IDs, and the committed source building in sync. |
| Seed tests | Use the archived catalog as their fixture, so counts (47 records, 12 photos) are independent of the live catalog. |
| Deliberate regressions | Including hidden dishes, ignoring review notes, finding only PNG photos, not reporting unmatched photos, menu IDs ignoring the restaurant, a `--check` that never fails, and accepting an unknown zone each fail the tests; files restored. |
| `pnpm verify` | Pass. API: 72 files/568 tests; web: 38 files/407 tests; builds pass. |
| Prettier `--end-of-line auto` and `git diff --check` | Pass for changed files (`plan.md` keeps its existing table warnings from `main`). |
| Fresh-database seed | Superseded by the full-catalog check below. |

### Full catalog (13 restaurants), 2026-10-23

- Restaurants added from Grab screenshots: Family Kebab Halal, Khang Mor Fah, Jong Hua A Ming, GINDON, Lung Yik Steak, Little Grin, Chef Toy, Sandwich Juseyo, Lao Ta Mala, Charoen Rot, Heng Heng Suki, Chor Charoen Phanich, Yang Hai MFU. Kept only complete single-person dishes; left out กับข้าว, sharing platters, unavailable, cut-off, unlisted, and ambiguous items; merged duplicates; stored regular prices instead of temporary Grab promotions.

| Check | Result |
|---|---|
| Data audit | 229 source dishes (222 visible, 7 hidden desserts and drinks); every dish has Thai and English names and descriptions; prices 25–299; no open review notes. |
| `pnpm verify` (after merging `origin/main`) | Pass. API 72 files/568 tests; web 38 files/407 tests; builds pass. `catalog:build --check` passes. |
| Seed into the empty local `kinraidee` database | `migrate deploy` then `db seed`: 766 records and links created (13 restaurants, 222 menu items, 510 taste links, 10 food types, 8 tastes, 3 zones). A second run reports 766 unchanged. No dessert or drink menu items reached the database. |
| Every filter combination via `POST /api/recommendations` | 1,584 combinations: 277 return dishes, 1,307 return a no-match suggestion, and every suggestion returns dishes when applied. No errors and no duplicate cards. |
| Browser | The meal flow lists the 10 visible food types and 8 tastes; ฿50–100 + เผ็ด + เมนูข้าว + ตรงข้ามมหาวิทยาลัย shuffled three cards from three different restaurants, each showing the no-photo state. |
| Admin API | Logged in as the seeded administrator: 13 restaurants and 222 menu items listed. |
| Retiring the archived catalog | A database seeded with the archived starter catalog (3 restaurants, 9 menu items active), then seeded with the current catalog, reported `Retired 3 archived restaurants and 9 archived menu items.`: 13 of 16 restaurants and 222 of 231 menu items active, and only the new Family Kebab Halal active. A second run retired nothing and left every record unchanged. New tests cover keeping IDs the current catalog uses, skipping already-deleted records, idempotency, and that no archived ID collides with the live catalog. |
| `pnpm verify` after the retirement change | Pass: API 72 files/570 tests; web 38 files/407 tests; builds pass. Two earlier full runs each failed 2–3 different web tests (logout and account-link tests) that pass in isolation, with no web changes since the last full pass; recorded as intermittent. The photo-copy seed test, which took 6–9 s on busy runs, now has a 30 s timeout. |

## Dish photos and photo-required recommendations

- Verification date: 2026-10-24 ICT. Base: `feat/catalog-source-format` (PR #92).

| Check | Result |
|---|---|
| Photo selection | Candidates from Unsplash and Openverse (Wikimedia Commons, Flickr) were checked by eye on contact sheets against each dish name; a second, stricter audit at larger size removed unclear or near-miss photos (for example a khao kluk kapi plate offered for bacon fried rice, chicken karaage for sauce variants, a ham sandwich for the saba baguette). Result: 187 photos across 104 of the 222 visible dishes; 118 dishes have no accurate stock photo and keep the food-type icon. All 187 image links returned `200 image/*`. |
| Wikimedia sizes | 800 px thumbnail links failed (`HTTP 400`); Commons photos now use the standard 960 px size. Covered by a test. |
| Unsplash download reports | Queued in `pending-downloads.json` and sent with `catalog:photos report-downloads` in batches under the 50-per-hour demo limit; 48 sent, 91 queued at the time of writing. |
| Photo required for recommendation | `availableWhere` adds `imageUrl: { not: null }`; repository tests assert it for candidates and the suggestion pool, and removing it fails 3 tests. Against the local database, all 1,584 filter combinations returned either cards or a working suggestion (200 with cards, 1,384 suggestions, all suggestions returned cards), with 0 recommended cards without a photo. |
| Browser (375 px) | Grilled salmon steak and ข้าวราดซอสเผ็ด x2 cards showed matching photos with the `ภาพประกอบ` label; a Creative Commons photo showed its `© creator · licence` credit on the card and in the confirmation dialog. |
| `pnpm verify` | Pass after the change (see below). |

## Catalog source owner-consent field removal - 2026-10-24

### Scope

- Removed `ownerConsent` from the restaurant catalog source schema and all 13 committed restaurant source files.
- Preserved source type, capture date, and delivery-markup provenance.
- Archived the previously approved intent and recorded the superseding human decision in `docs/05-log/20261024-log.md`.

### Results

| Command | Exit code | Result |
|---|---:|---|
| `pnpm --filter api catalog:build --check` | 0 | Pass: `catalog.seed.json` remains up to date after removing the source-only field. |
| `NODE_OPTIONS=--no-experimental-webstorage pnpm --filter api exec vitest run prisma/catalog-build.test.ts prisma/catalog-seed.test.ts prisma/seed.test.ts` | 0 | Pass: 3 files/55 tests. |
| `NODE_OPTIONS=--no-experimental-webstorage pnpm verify` | 0 | Pass: typecheck, lint, 598 API tests, 407 web tests, API build, OpenAPI generation, and web build. |
| `git diff --check` | 0 | Pass. |
| `pnpm format` | 1 | Existing generated-file formatting gap: only `src/api/prisma/data/catalog.seed.json` fails the current Prettier check; the generated file was not changed by this work and `catalog:build --check` requires its current generated form. |
| `node tests/wireframe-requirements.test.cjs` | 1 | Existing prototype gaps: 20 passed and 4 failed for stale English navigation/admin expectations. No wireframe or wireframe test was changed. |

### Safety checks

- The source schema is strict and now rejects a reintroduced `ownerConsent` key.
- Grab screenshots and Grab images remain excluded from the repository and published UI.
- Licensed stock-photo attribution and identifiable-person review requirements are unchanged.
- No database schema, migration, API route, web page, or production deployment changed.

## AI shortlist selection and Google Places evidence - 2026-10-25

### Scope

- Gemini selects the initial shortlist from at most six already eligible, restaurant-diverse candidates and returns strict JSON IDs with short Thai reasons.
- Invalid output, timeout, unavailable configuration, or provider error uses deterministic fallback. Replacement and pools of three or fewer bypass Gemini.
- Revealed cards request transient Google Places evidence through a separate public route. Only `Restaurant.googlePlaceId` is persisted.
- Seven of the 13 restaurants received human-reviewed Place ID mappings. Six ambiguous or missing search results remain unmapped and degrade to the unavailable state.

### Results

| Command/check | Exit code | Result |
|---|---:|---|
| `pnpm --filter api prisma migrate deploy` | 0 | Applied `20261024180000_add_google_place_id` to the local database. |
| `node --env-file-if-exists=.env --import tsx prisma/seed.ts` | 0 | Seeded the current catalog; 7 restaurant records updated with verified Place IDs and 759 records/links unchanged. |
| `pnpm --filter api providers:verify` | 0 | Live smoke test: Gemini received 6 candidates and returned 3 valid candidate IDs; Google Places returned live details with a rating and 4 reviews for a mapped restaurant. No secret values were printed. |
| `NODE_ENV=test pnpm --filter api recommendations:verify` | 0 | Deterministic path against 500 restaurants: first request 57.22 ms; warm p95 33.22 ms across 30 samples. Live AI is verified separately to avoid repeated paid calls. |
| `pnpm verify` | 0 | Final typecheck, lint, tests, and builds pass. API: 76 files/613 tests. Web: 38 files/409 tests. |
| `pnpm --filter api catalog:build --check` | 0 | Generated catalog is synchronized with source files and the seven Place ID mappings. |
| Secret/bundle scan | 0 | Actual Gemini and Google Places key values occur zero times in tracked files and the production web bundle; no `.env` file is tracked. |
| `git diff --check` | 0 | Pass. |
| `pnpm format` | 1 | Existing generated-file gap remains: only `src/api/prisma/data/catalog.seed.json` fails Prettier while `catalog:build --check` requires its generated form. All web files pass. |
| `node tests/wireframe-requirements.test.cjs` | 1 | Existing historical prototype result remains 20 passed/4 stale failures for English navigation/admin expectations. No wireframe file or test was changed. |

### Provider notes

- `gemini-2.5-flash-lite` returned `404 NOT_FOUND` for this API account. The provider named `gemini-3.5-flash-lite` as its replacement, so the environment-configurable default and local configuration were updated.
- External provider timeout is 5 seconds. A diagnostic run confirmed `gemini-3.1-flash-lite` exceeded that limit, while the configured model completed structured JSON within the approved path.
- The production web build passed with the pre-existing Vite warning that its main JavaScript chunk exceeds 500 kB.
- One full web-test run had an unrelated logout navigation test fail intermittently; it passed alone and the repeated complete web suite passed all 409 tests.

## Neon pooled/direct connection configuration - 2026-10-25

### Scope

- Prisma Client keeps using pooled `DATABASE_URL` for application queries.
- Prisma Migrate uses non-pooled `DIRECT_DATABASE_URL` through the schema `directUrl` setting.
- Local Prisma commands fall back to `DATABASE_URL` when a separate direct URL is absent. Production migration jobs receive the direct URL separately; the Cloud Run runtime does not need that credential.
- No Neon or Google Cloud production resource was created.

### Results

| Command/check | Exit code | Result |
|---|---:|---|
| `env -u DIRECT_DATABASE_URL pnpm --filter api prisma validate` | 0 | Pass: local fallback supplies the direct connection from `DATABASE_URL`. |
| `DATABASE_URL=<pooled-test-url> DIRECT_DATABASE_URL=<direct-test-url> pnpm --filter api prisma validate` | 0 | Pass: Prisma accepts separate pooled and direct PostgreSQL URLs. No database connection was opened by schema validation. |
| `env -u DIRECT_DATABASE_URL pnpm --filter api prisma generate` | 0 | Pass: Prisma Client 6.19.3 generated with the local fallback configuration. |
| `pnpm verify` | 0 | Pass: typecheck, lint, API 76 files/613 tests, web 38 files/409 tests, API build, OpenAPI generation, and web build. |
| `git diff --check` and focused Prettier checks | 0 | Pass for all Step 2 changes. Prisma's formatter passes for `schema.prisma`. |
| `pnpm format` | 1 | Existing generated-file gap remains: only `src/api/prisma/data/catalog.seed.json` fails Prettier; this Step 2 did not change it. |
| `node tests/wireframe-requirements.test.cjs` | 1 | Existing historical result remains 20 passed/4 stale failures for English navigation/admin expectations. Step 2 changed no wireframe file or test. |

## API container and Cloud Build preparation - 2026-10-25

### Scope

- Added a multi-stage Node.js 22 API container, repository Docker ignore rules, Cloud Build configuration, and an Artifact Registry runbook.
- The runtime image installs only production API dependencies, runs as non-root, listens on port 8080, keeps uploads disabled, and does not run migrations or seed during startup.
- Compiled ESM imports are rewritten to explicit `.js` paths. The generated Prisma Client is copied into the production dependency tree after `pnpm deploy`.
- No image was pushed and no Google Cloud or Neon production resource was created.

### Results

| Command/check | Exit code | Result |
|---|---:|---|
| Prisma generate with non-secret build URLs, then `pnpm --filter api build` | 0 | Pass: Prisma Client generated without a database connection; TypeScript and OpenAPI build completed. |
| Production `pnpm deploy` package simulation | 0 | Pass: 157 production packages installed; Argon2 native installation completed. |
| Compiled package runtime smoke | 0 | Pass after the ESM and Prisma packaging fixes: production-mode `node dist/server.js` started and `GET /health` returned `{"data":{"ok":true}}`. |
| Container secret boundary review | 0 | `.dockerignore` excludes `.env`, local uploads, source assets, docs, evidence, tests, build output, and web source. Database/provider secrets are not Docker build arguments or image layers. |
| `git diff --check` and focused Prettier checks | 0 | Pass for the container, Cloud Build, runbook, plan, log, and package-script changes. |
| `pnpm verify` | 0 | Pass: typecheck, lint, API 76 files/613 tests, web 38 files/409 tests, API build, OpenAPI generation, and web build. |
| `pnpm format` | 1 | Existing generated-file gap remains: only `src/api/prisma/data/catalog.seed.json` fails the API Prettier check. |
| `node tests/wireframe-requirements.test.cjs` | 1 | Existing historical result remains 20 passed/4 stale English navigation/admin assertions. No wireframe file or test changed. |
| Local Docker/Cloud CLI execution | N/A | Docker and `gcloud` are not installed in this environment. The production package stages were reproduced locally; the first actual image build remains the controlled Cloud Build step after deployment approval. |

## Firebase Hosting preparation - 2026-10-25

### Scope

- Added project-independent Firebase Hosting configuration for the Vite output under `src/web/dist`.
- `/api/**` rewrites to Cloud Run service `kinraidee-api` in `asia-southeast1` before the catch-all `/index.html` SPA fallback.
- Hashed Vite assets receive immutable one-year caching; `index.html` remains uncached. Baseline `nosniff`, frame-denial, and referrer-policy headers apply to Hosting responses.
- No Firebase project association, preview channel, Hosting release, Cloud Run revision, or public URL was created.

### Results

| Command/check | Exit code | Result |
|---|---:|---|
| Firebase JSON structural assertion | 0 | Pass: `src/web/dist` is the public directory, `/api/**` is the first rewrite, the service/region match the approved plan, and `/index.html` is the final fallback. |
| `VITE_API_BASE_URL=https://kinraidee-example.web.app pnpm --filter web build` | 0 | Pass: production Vite build completed and the configured same-origin Hosting URL was present in the generated JavaScript bundle. |
| Hosting cache/security-header review | 0 | Pass: only `/assets/**` receives immutable caching; `/index.html` receives `no-cache`; baseline headers contain no secret or environment-specific value. |
| `git diff --check` and focused Prettier checks | 0 | Pass for Firebase configuration, runbook, plan, log, and verification additions. |
| `pnpm verify` | 0 | Pass: typecheck, lint, API 76 files/613 tests, web 38 files/409 tests, API build, OpenAPI generation, and web build. |

## Artifact Registry and Cloud Build - 2026-10-26

### Scope

- Enabled Artifact Registry and Cloud Build for Google Cloud project `kinraidee-512615`.
- Created Docker repository `kinraidee` in `asia-southeast1` and granted its Cloud Build service account repository-writer access.
- Granted that service account object-viewer access only on the project Cloud Build source bucket.
- Built and pushed the API image with an immutable full-commit tag. No Cloud Run service or public endpoint was created.

### Results

| Command/check | Exit code | Result |
|---|---:|---|
| `gcloud services enable artifactregistry.googleapis.com cloudbuild.googleapis.com` | 0 | Both APIs enabled successfully. |
| Artifact Registry repository creation and IAM binding | 0 | Created Docker repository `kinraidee` in Singapore; Cloud Build can push images to it. |
| Initial `gcloud builds submit` | 1 | Diagnosed missing `storage.objects.get` on the Cloud Build source archive; fixed with bucket-scoped `roles/storage.objectViewer`. |
| First remote Docker build | 1 | Diagnosed missing `/workspace/docs/03-implementation` during OpenAPI generation and missing OpenSSL in the build stage. No image was pushed. |
| Dockerfile correction | 0 | Build stages install OpenSSL and create the generated OpenAPI output directory before the API build. |
| Cloud Build `386f3a6e-fdb1-4b64-bfdd-a26057e2348b` | 0 | Built and pushed `kinraidee-api:a98bcac9d8d7c35e5f8b99a2f09ddbe3be9e447a` in 2m44s. |
| Artifact Registry image listing | 0 | Verified digest `sha256:0d30f52c255ecc28a7c4c3c30dbf482dc19c6aad6dcc2c46a5246e0400e25c49` with the expected immutable tag. |

### Deployment gate

- This gate was approved and executed later on 2026-10-26; see the production deployment evidence below.

## Production deployment - 2026-10-26

### Scope

- Applied all three Prisma migrations to Neon through the direct maintenance connection.
- Seeded the initial administrator and approved catalog through the direct connection; runtime keeps the pooled connection.
- Deployed the immutable API image to Cloud Run and the Vite application to Firebase Hosting.
- Firebase Hosting serves the SPA and rewrites `/api/**` to the pinned current Cloud Run revision.

### Production resources

| Resource | Result |
|---|---|
| Firebase Hosting | `https://kinraidee-512615.web.app` |
| Cloud Run service | `kinraidee-api`, region `asia-southeast1` |
| Cloud Run revision | `kinraidee-api-00002-bgk`, 100% traffic |
| API image | `kinraidee-api:1d1297c1e1933466bdd75adc5cfe258aaaa1a487` |
| Image digest | `sha256:c17d5c8b3b785ce45f770ffa2eb0c0381fa3df957ccb5cd29dd8a5da778c9d9f` |
| Runtime limits | min 0, max 2, CPU 1, memory 512 MiB, concurrency 20, timeout 30 seconds |
| Runtime identity | `kinraidee-api-runtime@kinraidee-512615.iam.gserviceaccount.com` |

### Results

| Command/check | Exit code | Result |
|---|---:|---|
| `prisma migrate deploy` through `DIRECT_DATABASE_URL` | 0 | Applied `20260928172507_init`, `20261007120000_preference_any_choices`, and `20261024180000_add_google_place_id`. |
| Initial seed through direct maintenance connection | 0 | Seeded one administrator and 766 catalog records/links. Production local uploads remained disabled. |
| Production aggregate check | 0 | Verified 13 active restaurants, 222 active menu items, seven mapped restaurants, and one administrator. No personal record values were printed. |
| Seed optimization focused tests | 0 | `prisma/catalog-seed.test.ts` and `prisma/seed.test.ts`: 2 files/26 tests passed. Taste links now use one duplicate-safe batch insert; the remote initial transaction timeout is 120 seconds. |
| `pnpm verify` after Firebase cookie fix | 0 | API: 76 files/613 tests. Web: 38 files/409 tests. Typecheck, lint, tests, API build, OpenAPI generation, and web build passed. |
| Cloud Run `/health` | 0 | Returned HTTP 200 with `{"data":{"ok":true}}`. |
| Cloud Run database smoke | 0 | Public `/api/zones` returned HTTP 200 with the three production zones. |
| Firebase Hosting `/` and `/meal` | 0 | Both returned HTTP 200; `/meal` verified SPA fallback. |
| Firebase Hosting `/api/zones` | 0 | Returned HTTP 200 through the Hosting-to-Cloud Run rewrite. |
| Authentication through Hosting | 0 | Login returned 200, set the reserved `__session` HTTP-only cookie, and `/api/auth/me` returned 200 with that cookie. Initial testing found Firebase stripped the old cookie name; revision `00002-bgk` contains the verified fix. |
| Recommendation smoke | 0 | Returned three items through Hosting; all three reported selection source `AI`. |
| Google Places smoke | 0 | A mapped restaurant returned live details with four provider reviews through Hosting. |

### Remaining operational checks

- Google Cloud budget-alert amount and provider quota thresholds still require an explicit owner choice.
- Computer Crime Act Section 26 traffic-log applicability remains pending accountable human/legal review; this deployment does not claim the conditional requirement is inapplicable.
- Mobile visual QA and destructive protected-admin mutation smoke tests were not run against production.

## GitHub continuous deployment - 2026-10-26

### Scope

- Added production CD for pushes to `main`; the deployment job intentionally contains no lint or test stage.
- Authentication uses Google Workload Identity Federation restricted to `bear0420-47/Kinraidee` and `refs/heads/main`. No service-account key or Firebase token is stored in GitHub.
- The GitHub runner builds the API image and pushes it directly to Artifact Registry, applies Prisma migrations, deploys Cloud Run, builds the web, deploys Firebase Hosting, and performs read-only smoke checks.
- Production seed execution remains manual and is never part of CD.

### Results

| Command/check | Exit code | Result |
|---|---:|---|
| `actionlint .github/workflows/deploy-production.yml .github/workflows/verify.yml` | 0 | Both workflow files pass GitHub Actions syntax and expression validation. |
| GitHub Actions run `40226494466` | 0 | Every deployment step passed: OIDC, Docker authentication, image build/push, dependency install, migration, Cloud Run, web build, Firebase Hosting, and smoke tests. |
| Immutable deployment tag | 0 | Deployed API image tag `e08f979182abc7df04844abdac0445a8cd632903`. |
| Cloud Run revision check | 0 | Latest ready revision is `kinraidee-api-00003-5gz`. |
| Git status after push | 0 | `main` and `origin/main` synchronized before this evidence-only commit. |

### First-run correction

- Two initial runs stopped before changing production because `gcloud builds submit` rejected the managed source bucket for the federated deployer.
- Effective bucket and service-usage permissions were verified without exposing credentials. CD was simplified to build on the GitHub runner and push directly using repository-scoped `roles/artifactregistry.writer`.
- Diagnostic bucket objects and temporary impersonation/Cloud Build permissions were removed after verification.

## Automatic initial no-match adjustment - 2026-10-26

### Scope

- An initial three-card request that has no direct match now reuses the approved smallest-change algorithm, applies its effective conditions, and returns the shortlist in the same API response.
- The response contract replaces interactive `suggestion` data with optional `adjustment` metadata containing every changed field, complete effective conditions, and matching-result count.
- The web opens the cards immediately, announces the automatic changes, persists the explanation with the shortlist in `sessionStorage`, and uses the effective conditions for later replacements.
- One-card replacement remains strict and never changes conditions automatically. A true catalog no-match still offers manual editing.

### Results

| Command/check | Exit code | Result |
|---|---:|---|
| Focused API recommendation tests | 0 | Recommendation service, adjustment calculator, OpenAPI, and performance: 4 files/29 tests passed. |
| Focused recommendation route test | 0 | Public route/envelope and boundary parsing: 1 file/3 tests passed outside the socket-restricted sandbox. |
| Focused web recommendation tests | 0 | Automatic adjustment, direct-to-cards behavior, reload persistence, effective-condition replacement, true no-match, and shortlist helpers passed. Final focused regression run: 3 files/49 tests. |
| `pnpm verify` | 0 | Typecheck, lint, all tests, and both builds passed. API: 76 files/614 tests. Web: 38 files/409 tests. OpenAPI was regenerated during the API build. |
| `git diff --check` | 0 | Pass. |
| `pnpm format` | 0 | API and web formatting checks passed. The API package now explicitly ignores generator-owned `prisma/data/catalog.seed.json`; `catalog:build --check` separately verifies that artifact. |
| `node tests/wireframe-requirements.test.cjs` | 0 | 24/24 prototype requirements passed after stale English navigation/admin assertions were synchronized with the approved Thai prototype and current role-aware access behavior. |
| `pnpm --filter api catalog:build --check` | 0 | Confirmed `catalog.seed.json` exactly matches generator output. |
| Automatic-adjustment state regression | 0 | Shortlist transition coverage confirms adjustment metadata survives reject, replacement, and undo, so its disclosure remains visible for the active shortlist. |

### Build notes

- The web build keeps the existing warning that the main JavaScript chunk exceeds 500 kB.
- Rollup keeps the existing non-blocking warnings about comment annotations inside Zod dependencies.

## Full catalog (14 restaurants) - 2026-10-27

### Scope

- Added Shogun Steak (`shogun-steak`, zone `kotchapol`) from one batch of Grab menu screenshots captured 2026-10-27: 48 menu items, all Thai and English, with descriptions written for this catalog rather than copied from Grab.
- Stored Grab's regular prices (no promotion price was shown on any row) and kept `pricesInclude: grab-delivery-markup`.
- Kept the four menu sections สเต็ก, ของทานเล่น, สลัดผัก and ส้มตำ. The screenshots cover the whole menu: the in-app category picker lists exactly those four sections.

### Results

| Check | Result |
|---|---|
| `pnpm --filter api catalog:build` | Pass: 14 restaurants, 270 menu items (7 hidden); 0 local photos found, 270 missing and listed in `photo-checklist.csv`; stock photos for 137 dishes. |
| `pnpm --filter api catalog:build --check` | Pass: `catalog.seed.json is up to date.` |
| `pnpm --filter api exec prisma migrate deploy` | Applied the pending `20261024180000_add_google_place_id` migration. The local database was one migration behind; the seed failed with `Unknown argument 'googlePlaceId'` until this was applied and the Prisma client regenerated with `prisma generate --schema=prisma/schema.prisma`. |
| `pnpm --filter api prisma db seed` | Pass: `Seeded 926 catalog records and links (160 created, 33 updated, 733 unchanged, 0 stale taste links removed).` |
| Database read-back | `Shogun Steak - Kotchapol Land Road` exists in zone Kotchapol with 48 menu items; 7 of them resolve a stock photo and 41 have none yet. Catalog-wide: 14 active restaurants, 270 menu items. |
| `pnpm verify` | Pass (exit 0). Typecheck and lint done for API and web; API 76 files/614 tests; web 38 files/447 tests; both builds pass. The web build keeps the existing >500 kB chunk and Zod comment warnings. |
| Git | Not committed, not staged, nothing pushed. |

### Judgment calls

- ส้มตำ (11 plates, 49–60 baht) was kept as single-portion dishes in `salads-yum-somtam`. Nothing in this menu was a shared rice-side; the shop has no กับข้าว section.
- `ผักโขมอบชีส` (79) was left out because the row is greyed out, and `ตำลาวหมูยอ` because the price is outside the last screenshot.
- Seven photo keys reuse existing pools instead of new ones: `fried-chicken-steak`, `beef-steak`, `carbonara`, `vegetable-salad`, `boiled-chicken-breast-salad`, `tuna-salad`, `grilled-chicken-wings`.
- The remaining 41 photo keys have no pool yet and are the input for the photo handoff.

### Revision later the same day

- `black-pepper-beef-steak` uses its own photo key instead of the shared `beef-steak`; the T-bone English name is `Thai Grain-Fed Beef T-Bone Steak`; `tomato-spaghetti` tastes are `["savory"]`.
- Removed the pure side snacks (14): ทอดรวม, the seven fries (plain, cheese sauce, cheese/nori/paprika/BBQ/spicy powder), ขนมปังกระเทียม, เกี๊ยวซ่า, ไก่ป็อบ, นักเก็ต, มันบดซอสเกรวี่ and มันบดอบชีส. The two wing dishes stay. Shogun Steak now has 34 dishes.
- `pnpm --filter api catalog:build`: 14 restaurants, 256 menu items; `--check` reports the seed is up to date; 28 photo keys still have no pool.
- The seed only upserts, so it reported 880 unchanged and left the 14 removed dishes active. They were soft-deleted by name on the **local** database only (`UPDATE "MenuItem" SET "deletedAt"`), which brings the local Shogun Steak row count to 34 active dishes, 6 of them with a stock photo.
- `pnpm verify`: pass (exit 0). API 76 files/614 tests; web 38 files/447 tests; typecheck, lint and both builds pass.

### Dish photos (same day)

- 117 photo keys of visible dishes had no pool. 20 Unsplash searches were made (38 of the 50 hourly requests including download reports; nothing left queued) and 3 keys reused candidates cached by an earlier session. No Openverse results were added: the Openverse API did not answer from this host during the session, so every recorded photo is Unsplash.
- Twelve keys were filled and put on one contact sheet for review. A human review rejected five of them: `long-bean-salad` (green sprouts, not pounded long beans), `grilled-chicken-salad` (a chicken stir-fry in a pan, no salad), `shrimp-rice-bowl` (a shrimp Caesar salad, and a chicken-and-quinoa bowl), `crispy-pork-curry-paste-rice` (rice noodles with avocado, two near-duplicates of one shoot) and `wai-wai-pad-cha-seafood` (pad thai with cashews, not pad cha with instant noodles). Their pools were set back to `photos: []` and their `query` kept.
- Seven keys keep a photo: `australian-ribeye-steak`, `bbq-pork-steak`, `pork-chop`, `pork-ribs` (2), `thai-papaya-salad` (3), `fried-chicken-wings`, `tomato-spaghetti`. All 10 image URLs answer HTTP 200.
- `pnpm --filter api catalog:build`: 14 restaurants, 256 menu items (7 hidden), stock photos for 143 dishes. `--check`: `catalog.seed.json is up to date.`
- `pnpm --filter api prisma db seed`: `Seeded 880 catalog records and links (0 created, 5 updated, 875 unchanged, 0 stale taste links removed).` The five updated records are the reverted dishes, whose `imageUrl` is now empty.
- Database read-back (local): 256 active menu items, 143 with an `imageUrl`; the seven dishes above resolve one, the five reverted dishes resolve none.
- `pnpm verify`: pass (exit 0). API 76 files/614 tests; web 38 files/447 tests; typecheck, lint and both builds pass.
- Lesson recorded for future passes: describe what a candidate photo actually shows first, then compare that description with the dish name; reject when the main ingredient, the starch (rice, noodles, salad) or the cooking style differs.
- Git: not committed, not staged, nothing pushed.
