# Engineering Guidelines

This file is the implementation guardrail for Kinraidee. It records approved stack decisions and coding rules so AI agents implement planned work consistently instead of inventing structure or dependencies.

Before adding or changing any feature module, follow `docs/03-implementation/module-implementation-checklist.md`. Before adding or changing Prisma models, read `docs/03-implementation/data-model.md`. That checklist is the required module gate; this file defines the general engineering rules only.

## Technology Stack

### Web

| Area | Decision |
|---|---|
| Framework | React |
| Language | TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS |
| Icons | `@phosphor-icons/react` only |
| Routing | React Router |
| Server state | TanStack Query |
| Forms | React Hook Form |
| Validation | Zod |
| API client | `openapi-typescript` + `openapi-fetch` |
| Test runner | Vitest |
| Component/E2E testing | TBA by QA |

### API

| Area | Decision |
|---|---|
| Framework | Express 5 |
| Language | TypeScript |
| Runtime | Node.js |
| Module system | ESM |
| Dev runner | `tsx` |
| Build compiler | `tsc` |
| Validation | Zod |
| API contract generation | `@asteasolutions/zod-to-openapi` |
| Logging | `pino` + `pino-http` |
| Middleware | `helmet`, `cors`, `cookie-parser`, `express.json({ limit: '100kb' })` |
| Test runner | Vitest |

### Database

| Area | Decision |
|---|---|
| Database | PostgreSQL |
| ORM/query layer | Prisma |
| Migration tool | Prisma Migrate |
| Generated client | Prisma Client |

### Workspace And Tooling

| Area | Decision |
|---|---|
| Package manager | pnpm |
| Workspace model | root workspace with `src/web` and `src/api` packages |
| Lint | ESLint |
| Format | Prettier |
| Environment config | `.env` files validated with Zod |
| Import alias | `@/` maps to each package's `src` directory |

## Repository Structure

```txt
src/
  web/
    README.md
    src/
  api/
    README.md
    prisma/
    src/
```

Root workspace files:

```txt
package.json
pnpm-workspace.yaml
```

Do not create `src/shared/` until both `web` and `api` use the same code for real.

## Web Structure

```txt
src/web/src/
  main.tsx
  App.tsx
  router.tsx
  api/
    client.ts
    openapiTypes.ts
  pages/
    meal/
      MealPage.tsx
      components/
        RecommendationForm.tsx
        RecommendationResults.tsx
    profile/
      ProfilePage.tsx
      components/
    admin/
      AdminPage.tsx
      components/
  components/
    Button.tsx
    FieldError.tsx
    PageShell.tsx
  hooks/
    meal/
      useRecommendations.ts
    profile/
    admin/
  schemas/
    meal/
      recommendationSchemas.ts
    profile/
    admin/
  lib/
    queryClient.ts
```

### Web Rules

- `pages/<page>/` contains page components and local components for that page.
- `pages/<page>/components/` components are page-local.
- Root `components/` contains only components reused by at least two pages.
- Root `hooks/<page>/` contains hooks grouped by page or domain.
- Root `schemas/<page>/` contains Zod schemas grouped by page or domain.
- Move hooks or schemas to `hooks/shared/` or `schemas/shared/` only after real cross-page reuse exists.
- Components do not call `fetch` or the API client directly.
- Pages may call hooks and compose UI.
- TanStack Query hooks use typed API client functions.
- API calls go through `openapi-fetch`; no hand-written endpoint strings outside `api/` or query hooks.
- Styling uses Tailwind CSS by default. Custom CSS is allowed only when Tailwind cannot express the behavior clearly.
- Use `@phosphor-icons/react` for application icons. Do not handwrite, copy, generate, or embed custom SVG icon paths.
- Database-backed icon values must resolve through a controlled registry; never dynamically import a component directly from an untrusted database string.
- Import only the specific Phosphor icon components used by the application; do not use a full-package namespace import.
- UI must follow `docs/02-design/design-system.md` and the approved user journey.
- Do not persist personal data in browser storage unless the specification and lawful basis approve it.
- Use approved external image URLs in every environment. Development/test may also use API-served `/uploads` URLs; production must not offer internal uploads until durable object storage is implemented.

### Web Naming

- Pages: `PascalCase.tsx`
- Components: `PascalCase.tsx`
- Hooks: `camelCase.ts`
- Schemas: `camelCase.ts`
- API files: `camelCase.ts`
- Lib files: `camelCase.ts`

Examples:

```txt
pages/meal/MealPage.tsx
pages/meal/components/RecommendationForm.tsx
hooks/meal/useRecommendations.ts
schemas/meal/recommendationSchemas.ts
api/openapiTypes.ts
lib/queryClient.ts
```

## API Structure

```txt
src/api/
  prisma/
    schema.prisma
    migrations/
  src/
    app.ts
    server.ts
    routes.ts
    config/
      env.ts
    lib/
      logger.ts
      prisma.ts
    middleware/
      errorHandler.ts
      requestId.ts
      requireAuth.ts
    modules/
      auth/
        auth.routes.ts
        auth.controller.ts
        auth.dto.ts
        auth.service.ts
        auth.repository.ts
      users/
        users.routes.ts
        users.controller.ts
        users.dto.ts
        users.service.ts
        users.repository.ts
      zones/
        zones.routes.ts
        zones.controller.ts
        zones.dto.ts
        zones.service.ts
        zones.repository.ts
      food-types/
        food-types.routes.ts
        food-types.controller.ts
        food-types.dto.ts
        food-types.service.ts
        food-types.repository.ts
      tastes/
        tastes.routes.ts
        tastes.controller.ts
        tastes.dto.ts
        tastes.service.ts
        tastes.repository.ts
      restaurants/
        restaurants.routes.ts
        restaurants.controller.ts
        restaurants.dto.ts
        restaurants.service.ts
        restaurants.repository.ts
      menu-items/
        menu-items.routes.ts
        menu-items.controller.ts
        menu-items.dto.ts
        menu-items.service.ts
        menu-items.repository.ts
      recommendations/
        recommendations.routes.ts
        recommendations.controller.ts
        recommendations.dto.ts
        recommendations.service.ts
        recommendations.repository.ts
        recommendations.helpers.ts
      favorites/
        favorites.routes.ts
        favorites.controller.ts
        favorites.dto.ts
        favorites.service.ts
        favorites.repository.ts
      preferences/
        preferences.routes.ts
        preferences.controller.ts
        preferences.dto.ts
        preferences.service.ts
        preferences.repository.ts
      recommendation-history/
        recommendation-history.routes.ts
        recommendation-history.controller.ts
        recommendation-history.dto.ts
        recommendation-history.service.ts
        recommendation-history.repository.ts
      audit-logs/
        audit-logs.routes.ts
        audit-logs.controller.ts
        audit-logs.dto.ts
        audit-logs.service.ts
        audit-logs.repository.ts
    openapi/
      registry.ts
      generateOpenapi.ts
    shared/
      httpError.ts
      httpResponse.ts
```

### API Module Rules

- Folder names use plural or domain names.
- Compound module folders use `kebab-case`.
- File names use `<module>.<layer>.ts`.
- File prefix matches the module folder name.
- `.types.ts` is allowed only when inferred Zod/Prisma types become hard to read.

Examples:

```txt
modules/recommendations/recommendations.routes.ts
modules/menu-items/menu-items.repository.ts
modules/audit-logs/audit-logs.controller.ts
```

### API Layer Rules

- `routes` connects endpoint paths and middleware only.
- `app.ts` wires global middleware, `/health`, the single `routes` composition router, and `errorHandler` only. It must not import feature modules directly.
- `routes.ts` is the API route composition file. It may grow with `routes.use(...)` registrations, but must not contain route handlers or business logic.
- `controller` parses request data through `dto`, calls `service`, and returns via response helpers.
- `dto` owns Zod request schemas, response schemas, parsing helpers, and response mapping.
- `service` owns business flow and use-case decisions.
- `repository` talks to Prisma and returns DB data only.
- `helpers` contains module-local pure functions when they make the service easier to read.
- Controllers and services throw `HttpError` for expected errors.
- Controllers never handwrite success or error envelopes.
- Module OpenAPI definitions live in `<module>.openapi.ts`; `openapi/registry.ts` only creates the registry and calls module registration functions.
- `openapi/registry.ts` may grow with registration calls, but must not contain endpoint schemas or route definitions inline.

### Helper Rules

- Start with module-local helpers.
- Use `<module>.helpers.ts` when helper count is small.
- Split to `helpers/<verb-noun>.ts` only when helpers become large or important enough to read alone.
- Move helper code to shared only after at least two modules use it.
- Shared helpers must not contain module-specific business rules.
- Shared helpers must have specific names such as `httpResponse.ts`, `httpError.ts`, or `validation.ts`.
- Do not create generic `utils.ts`, `helpers.ts`, `common.ts`, or `misc.ts`.
- Code that touches DB, recommendation session state, or auth must not live in generic shared helpers.

### API Response Rules

Success responses use an envelope:

```json
{
  "data": {}
}
```

List responses may include metadata:

```json
{
  "data": [],
  "meta": {
    "limit": 20,
    "nextCursor": null
  }
}
```

Error responses use an error envelope:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request.",
    "requestId": "req_550e8400-e29b-41d4-a716-446655440000"
  }
}
```

### Recommendation API Contract

Use one stateless endpoint for both initial shortlist and replacement requests:

```http
POST /api/recommendations
```

Request shape:

```json
{
  "conditions": {
    "budget": "BETWEEN_50_100",
    "tasteId": "taste_spicy",
    "foodTypeId": "food_type_rice",
    "zoneId": null
  },
  "rejectedMenuItemIds": [],
  "displayedMenuItemIds": [],
  "count": 3
}
```

- `tasteId: null` means `อะไรก็ได้`.
- `foodTypeId: null` means `อะไรก็ได้`.
- `zoneId: null` means `ที่ไหนก็ได้`.
- `rejectedMenuItemIds` contains menu items that must not return in the current browser session.
- `displayedMenuItemIds` contains menu items currently occupying other card slots and prevents duplicate replacement results.
- `count` accepts only `1` for replacement or `3` for an initial shortlist.

Budget uses a closed enum in the first release:

```ts
type BudgetRange =
  | 'UNDER_50'
  | 'BETWEEN_50_100'
  | 'BETWEEN_101_200'
  | 'OVER_200'
```

Mapping:

- `UNDER_50` → `price < 50`
- `BETWEEN_50_100` → `price >= 50 && price <= 100`
- `BETWEEN_101_200` → `price >= 101 && price <= 200`
- `OVER_200` → `price > 200`

Do not accept custom minimum/maximum prices in the first-release recommendation request.

Successful shortlist and replacement responses use the same shape:

```json
{
  "data": {
    "items": [
      {
        "id": "menu_1",
        "name": {
          "th": "ข้าวกะเพราไก่",
          "en": "Chicken Basil Rice"
        },
        "description": {
          "th": "ข้าวกะเพราไก่รสเผ็ด",
          "en": "Spicy chicken basil with rice"
        },
        "price": 65,
        "imageUrl": "https://images.example.com/menu_1.webp",
        "restaurant": {
          "id": "restaurant_1",
          "name": {
            "th": "ร้านป้าหน้ามอ",
            "en": "Pa Front Gate"
          }
        },
        "zone": {
          "id": "zone_1",
          "name": {
            "th": "หน้ามอ",
            "en": "Front Gate"
          }
        },
        "foodType": {
          "id": "food_type_1",
          "name": {
            "th": "ข้าว",
            "en": "Rice"
          },
          "icon": "rice"
        },
        "tastes": [
          {
            "id": "taste_1",
            "name": {
              "th": "เผ็ด",
              "en": "Spicy"
            }
          }
        ],
        "rationale": {
          "matchedBudget": true,
          "matchedTaste": true,
          "matchedFoodType": true,
          "matchedZone": false
        }
      }
    ]
  }
}
```

- `items` contains zero to three entries for an initial request and zero or one entry for a replacement request.
- Do not return public-card-irrelevant fields such as `deletedAt`, timestamps, `imageKey`, restaurant phone, or audit metadata.
- `rationale` is structured API data; the web owns localized display wording.
- A rationale boolean is `true` when the user supplied that specific constraint and the returned item matched it.
- A rationale boolean is `false` when that condition was unrestricted (`อะไรก็ได้` / `ที่ไหนก็ได้`). It must never mean that the API returned an item that violated a supplied mandatory filter.

No-match responses remain successful `200` responses because the request is valid and the empty result is a normal recommendation outcome:

```json
{
  "data": {
    "items": [],
    "relaxation": {
      "field": "zone",
      "from": {
        "type": "ZONE",
        "id": "zone_front_gate",
        "label": {
          "th": "หน้ามอ",
          "en": "Front Gate"
        }
      },
      "to": {
        "type": "ANY_ZONE",
        "id": null,
        "label": {
          "th": "ที่ไหนก็ได้",
          "en": "Any zone"
        }
      },
      "resultCount": 4
    }
  }
}
```

If no single approved relaxation produces a result:

```json
{
  "data": {
    "items": [],
    "relaxation": null
  }
}
```

- `relaxation.field` possible values are `zone`, `budget`, `taste`, and `foodType`.
- `from` and `to` are structured values with type, nullable database ID, and localized label.
- `RelaxationValue.type` accepts only `BUDGET_RANGE`, `TASTE`, `ANY_TASTE`, `FOOD_TYPE`, `ANY_FOOD_TYPE`, `ZONE`, and `ANY_ZONE`.
- A `BUDGET_RANGE` value uses a `BudgetRange` enum value as its `id`. `TASTE`, `FOOD_TYPE`, and `ZONE` use their database record ID. Every `ANY_*` value uses `id: null`.
- `resultCount` is the number of qualifying menu items after applying only the suggested relaxation.
- The API chooses the first relaxation that produces results using the approved priority. The web owns the localized explanatory sentence and action labels.
- Do not return `404` for a valid no-match recommendation request.

Recommendation request validation and normalization:

- Reject a malformed or unknown `tasteId`, `foodTypeId`, or `zoneId` with HTTP 400 and `VALIDATION_ERROR`. Include the affected field in the validation details. These master-data models do not use soft deletion in the approved schema. Never reinterpret an invalid filter as an unrestricted condition.
- Reject malformed exclusion entries, including non-string values and empty strings, with HTTP 400 and `VALIDATION_ERROR`.
- Deduplicate `rejectedMenuItemIds` and `displayedMenuItemIds` before querying.
- When the same menu-item ID appears in both arrays, rejected state takes precedence and the item remains excluded.
- Ignore well-formed exclusion IDs that do not exist or reference soft-deleted menu items. Browser session state may outlive an admin catalog change.

Recommendation selection rules:

- Apply mandatory filters and exclusions before randomization.
- A menu item matches a selected taste when at least one of its linked tastes has the selected `tasteId`; additional linked tastes do not disqualify it.
- Randomize each request without accepting a client seed.
- Fill slots from distinct restaurants first. Only use another menu from an already represented restaurant when there are not enough qualifying distinct restaurants.
- Tests assert invariants rather than fixed menu IDs: every item satisfies supplied filters, excluded IDs never return, item IDs do not repeat, distinct restaurants are preferred, and the result count never exceeds the request count.
- A replacement request with no remaining eligible menu returns HTTP 200 with `items: []` and `relaxation: null`. The web marks that slot as having no more choices; replacement requests never trigger condition-relaxation suggestions.

Rules:

- `ok(res, data, meta?)` returns HTTP 200.
- `created(res, data, meta?)` returns HTTP 201.
- `noContent(res)` returns HTTP 204.
- Error responses go through central `errorHandler`.
- Unknown errors become `INTERNAL_ERROR`.
- HTTP status codes remain meaningful: 400, 401, 403, 404, 409, and 500 are the default error families.
- Application error codes use stable strings such as `VALIDATION_ERROR`, `UNAUTHENTICATED`, or `MEAL_NOT_FOUND`.

### API Observability Rules

- Generate request IDs with Node `crypto.randomUUID()`.
- Prefix generated request IDs with `req_`.
- Reuse incoming `x-request-id` only when it passes validation.
- Return `x-request-id` on every response.
- Include `requestId` in every error body.
- Use `pino-http` for HTTP request logging.
- Logs must not include secrets, tokens, email addresses, raw GPS coordinates, full request bodies, or unnecessary personal data.
- Validation failures log safe summaries only.

### API Middleware Rules

- Use `helmet` for HTTP security headers.
- Use `cors` with an environment-driven origin allowlist.
- Use `credentials: true` for JWT auth cookies.
- Never use wildcard CORS origin with credentials.
- Use `cookie-parser` for auth cookies.
- Internal image uploads are development/test only and use an ignored configured directory served from `/uploads`.
- Production startup must reject configuration that enables local uploads. Production accepts approved external image URLs until the deferred durable object-storage issue is implemented.
- Internal upload endpoints require `ADMIN`, accept one JPEG/PNG/WebP image up to 2 MiB, validate actual file signatures, generate filenames, and never trust client filenames or MIME declarations alone.
- Restaurant/MenuItem soft deletion keeps the referenced image. Replacement removes an internally owned superseded file only after the database safely points to the replacement.
- Use `express.json({ limit: '100kb' })` for JSON request bodies.

### Async Error Rules

- Use Express 5 promise error forwarding.
- Do not use `asyncHandler` by default.
- Expected errors throw `HttpError`.
- Unknown thrown errors reach the central `errorHandler`.

## API Contract Rules

- Zod schemas are the runtime validation source of truth.
- OpenAPI is generated from registered Zod schemas using `@asteasolutions/zod-to-openapi`.
- Generated OpenAPI file lives at `docs/03-implementation/openapi.json`.
- Generated OpenAPI files must not be edited by hand.
- Every API route with request or response data must register its Zod schema and OpenAPI path.
- Web OpenAPI types are generated with `openapi-typescript`.
- Web API calls use `openapi-fetch`.

Contract flow:

```txt
API Zod schemas
  -> @asteasolutions/zod-to-openapi
  -> docs/03-implementation/openapi.json
  -> openapi-typescript
  -> src/web/src/api/openapiTypes.ts
  -> openapi-fetch typed API calls
```

## Auth And Session Rules

- Public meal workflow does not use anonymous server-side sessions.
- Web stores current recommendation conditions and rejected menu-item IDs in `sessionStorage`.
- Recommendation API is stateless; each request sends conditions and rejected menu-item IDs.
- Do not persist anonymous recommendation session state in PostgreSQL.
- Authentication uses email/password.
- Use dedicated `/login` and `/register` pages, not authentication modals. Preserve recommendation state in `sessionStorage` and accept only a validated safe internal return target after successful login.
- Email is the login identifier; the first full-app pass does not verify email ownership or implement verification tokens/emails.
- Self-service password reset is deferred. Do not add email delivery, reset tokens, reset endpoints, or reset screens in the first full-app pass.
- Registered-user password change is deferred. Do not add change-password endpoints or screens in the first full-app pass.
- Registered-account data is processed only for optional account features: login, authentication, saved menu-item favorites, saved default recommendation preferences, and selected-menu history.
- Anonymous F1–F7 recommendation remains available without an account.
- Do not use registered-account data for advertising, unrelated profiling, or unrelated third-party disclosure.
- Logged-in users record selected-menu history when they explicitly select a menu item; anonymous users do not write history to PostgreSQL.
- Users must be able to clear selected-menu history. Do not add a separate history opt-in toggle in the first full-app pass.
- Favorites and selected-menu history keep soft-deleted menu items visible with an unavailable status, but public catalog and recommendation flows must exclude `deletedAt != null` records.
- Budget quick-select ranges are `ไม่เกิน ฿50`, `฿50–100`, `฿101–200`, and `มากกว่า ฿200`. The system must not preselect a budget by default.
- Taste filter options come from admin-managed `Taste` master data sorted by `sortOrder`, plus special UI option `อะไรก็ได้`. Do not persist `อะไรก็ได้` as a `Taste` row.
- Food-type filter options come from admin-managed `FoodType` master data sorted by `sortOrder`, plus special UI option `อะไรก็ได้`. Do not persist `อะไรก็ได้` as a `FoodType` row.
- Zone filter options come from admin-managed `Zone` master data sorted by `sortOrder`, plus special UI option `ที่ไหนก็ได้`. Do not persist `ที่ไหนก็ได้` as a `Zone` row. Do not implement GPS/current-location controls in the first release.
- Recommendation UI uses the `สับการ์ดเมนู` shuffle-card pattern. The recommendation API returns the complete filtered shortlist once; individual card reveal and `เปิดทั้งหมด` are client-side presentation state only.
- Use one stateless recommendation endpoint, `POST /api/recommendations`, for both initial shortlist requests and single replacement requests.
- Rejecting a displayed menu requests one replacement excluding rejected IDs and currently displayed menu IDs. Undo restores the original card in the same slot/reveal state, removes the replacement, and removes the original menu ID from rejected IDs.
- No-match relaxation priority is `Zone` → `Budget` → `Taste` → `FoodType`. Offer only the first relaxation that produces at least one matching menu item: specific zone to `ที่ไหนก็ได้`, budget up one range, specific taste to `อะไรก็ได้`, then specific food type to `อะไรก็ได้`.
- A no-match suggestion panel has two actions: `ใช้เงื่อนไขนี้แล้วสับใหม่` applies the single suggested relaxation and requests recommendations again; `แก้เงื่อนไขเอง` returns to the condition summary with selections preserved. If no relaxation produces results, show only manual editing.
- Selected-menu history is written only when a logged-in user confirms `เอาเมนูนี้แหละ`; card reveal or dialog open must not write history. Anonymous confirmation does not write history to PostgreSQL.
- After confirmation success, `กลับหน้าหลัก` is the only dialog action. It clears current conditions, rejected IDs, shortlist, reveal state, and replacement/undo state before returning Home. A new recommendation flow always starts from Home.
- Browser authentication uses JWT stored in an HTTP-only cookie.
- JWT lifetime is 7 days.
- Auth cookie flags: `HttpOnly`, `SameSite=Lax`, and `Secure` in production.
- Password hashing uses Argon2id.
- Authorization uses `USER` and `ADMIN` roles.
- Use one shared `/login` route for `USER` and `ADMIN`; do not create a separate administrator login route or screen.
- Account routes use `/account`, `/account/favorites`, `/account/history`, and `/account/preferences`.
- Administrator routes use `/admin`, `/admin/zones`, `/admin/food-types`, `/admin/tastes`, `/admin/restaurants`, `/admin/menu-items`, and `/admin/audit-logs`.
- Anonymous access to `/admin/*` redirects to `/login?returnTo=<internal-admin-path>`. Accept only validated same-origin internal paths for `returnTo`; never redirect to an absolute or protocol-relative URL.
- After login, `ADMIN` returns to a valid requested `/admin/*` path. A logged-in `USER` requesting `/admin/*` redirects to `/account` and receives the message `บัญชีนี้ไม่มีสิทธิ์จัดการระบบ`.
- An authenticated `ADMIN` visiting `/login` redirects to `/admin`; an authenticated `USER` visiting `/login` redirects to `/account`.
- The only `ADMIN` account in the first full-app pass is created by the approved environment-backed seed process.
- Public registration always creates `USER`; role input from clients must be rejected or ignored at the validation boundary.
- Do not implement admin creation, invitation, role promotion/demotion, or admin user-management APIs/screens.
- Do not implement administrator password-change or password-reset APIs/screens; administrator credentials are provisioned by the initial environment-backed seed only.
- Protected API routes must include authorization checks.
- Auth tokens must not be stored in `localStorage`.
- Email is visible to the account owner and authentication flow only.
- Catalog administrators must not receive user email lists in the first full-app pass.
- Do not implement admin user-management APIs or screens until a separate support role, permission rule, endpoint spec, and audit rule are approved.
- Application audit logs for protected catalog mutations are retained for 180 days and are separate from Computer Crime Act traffic logs.
- Only `ADMIN` users can view application audit logs. Audit-log responses may include `actorId`, but must not include actor email in the first full-app pass. Viewing audit logs does not create another audit-log event.
- Do not implement Computer Crime Act traffic-log storage until an accountable human/legal reviewer confirms Section 26 applicability.
- `AuditLog` must never be treated as a substitute for legal traffic logs.
- If Section 26 applies, require a separately approved traffic-log schema, field inventory, access rule, security review, and retention configuration before public production deployment.

## Database Rules

- Prisma schema lives under `src/api/prisma/`.
- Prisma migrations are required once DB schema exists.
- Use Prisma Client for database access.
- Avoid raw SQL unless Prisma cannot express the query clearly.
- Schema changes must trace to requirement, backlog, or legal IDs.
- Do not store raw GPS coordinates by default.
- Retention behavior must match `rule.md`.
- Provide seed support for the initial administrator, minimum master data, and local/demo sample restaurant/menu data.
- Seed data may focus on MFU-area samples for demo, but product code and schema must not hardcode MFU as the only supported area.
- Real catalog maintenance is done through protected admin APIs/UI after initial setup.
- Seed data must not contain real personal data.
- Real restaurant/menu seed data must come from team-collected or otherwise authorized sources and record the source plus verification date in seed evidence.
- Do not scrape or commit unnecessary personal data for seed content.
- Seed images must be owned by the team, explicitly authorized, or generated placeholders. Do not commit restaurant photos with identifiable people unless a lawful basis is approved.
- Unverified catalog seed rows must be marked as synthetic/sample data.

## Environment Rules

- Commit `.env.example` files.
- Never commit `.env` files.
- Validate environment variables with Zod at app startup.
- Fail fast when required env is missing or invalid.
- Web environment variables must use the `VITE_` prefix.
- Secrets must never be exposed through web environment variables.

Likely API env:

```txt
DATABASE_URL=
JWT_SECRET=
ARGON2_MEMORY_COST=
ARGON2_TIME_COST=
ARGON2_PARALLELISM=
CORS_ALLOWED_ORIGINS=
```

Likely web env:

```txt
VITE_API_BASE_URL=
```

## TypeScript Rules

Both web and API use strict TypeScript guardrails:

```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "exactOptionalPropertyTypes": true,
  "noImplicitOverride": true,
  "noFallthroughCasesInSwitch": true
}
```

Rules:

- Do not disable strict compiler rules to make implementation pass quickly.
- Use `import` and `export`; do not use `require` or `module.exports`.
- Use `@/` for cross-folder imports.
- Use relative imports only inside the same folder or immediate local module.

## Dependency Rules

- Prefer existing platform features and installed tools before adding dependencies.
- Add dependencies when they reduce meaningful code, improve correctness, or provide a clear safety guardrail.
- New dependencies must have a clear owner and purpose.
- Use verified lower-bound ranges such as `^9.39.5` instead of broad ranges such as `^9.0.0`; upgrade deliberately after checking peers and running verification.
- Do not add framework-level abstractions for one use case.
- Do not add shared packages or helper libraries for future reuse.

## Workspace Scripts

Root scripts should expose consistent commands for humans and AI agents:

```json
{
  "dev:web": "pnpm --filter web dev",
  "dev:api": "pnpm --filter api dev",
  "build": "pnpm -r build",
  "test": "pnpm -r test",
  "lint": "pnpm -r lint",
  "format": "pnpm -r format",
  "typecheck": "pnpm -r typecheck",
  "verify": "pnpm typecheck && pnpm lint && pnpm test && pnpm build"
}
```

## AI Coding Rules

- Read `AGENTS.md`, `rule.md`, `docs/plan.md`, the current specification, and this file before coding.
- Implement only approved backlog scope.
- Keep diffs minimal and focused.
- New modules must map to a requirement, backlog item, legal requirement, or approved design artifact.
- Do not invent endpoints, roles, permissions, persistent data fields, or UI flows outside approved scope.
- Run relevant checks and record exact results in `docs/verification.md` before reporting implementation complete.

### GitHub Issue Implementation Workflow

Every human or AI developer follows the same lifecycle:

1. Assign the issue to the implementer before editing code.
2. Read the complete issue, linked requirements/design documents, and every `Dependency Gate` comment.
3. Do not start implementation while a required dependency issue remains open, unless the issue explicitly permits parallel work or a human records an approved exception.
4. Complete `module-implementation-checklist.md` before adding or changing a feature module. Stop and ask when required information is missing or conflicting.
5. Implement only the issue scope and acceptance criteria. Record any approved deviation in `docs/plan.md` and the issue.
6. Add or update focused tests, run the required verification commands, and record exact results in `docs/verification.md`.
7. Open a pull request that links the issue and summarizes implementation, verification, known limitations, and documentation changes. Use `Closes #<issue-number>` only when the pull request fully satisfies the issue.
8. Do not close the issue merely because code was written or pushed. Keep it open while verification, review, requested changes, or required approvals remain incomplete.
9. After required checks pass, findings are resolved, and the human approves and merges the pull request, confirm every acceptance criterion is satisfied. The linked pull request may then close the issue automatically; otherwise close it manually with a final verification summary.
10. If only part of the issue is complete, do not close it. Create or link follow-up issues and keep the original open unless a human explicitly re-scopes and approves it.
