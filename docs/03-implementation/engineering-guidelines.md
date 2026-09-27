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
- UI must follow `docs/02-design/design-system.md` and the approved user journey.
- Do not persist personal data in browser storage unless the specification and lawful basis approve it.

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
- Email is the login identifier; the first full-app pass does not verify email ownership or implement verification tokens/emails.
- Self-service password reset is deferred. Do not add email delivery, reset tokens, reset endpoints, or reset screens in the first full-app pass.
- Registered-user password change is deferred. Do not add change-password endpoints or screens in the first full-app pass.
- Registered-account data is processed only for optional account features: login, authentication, saved menu-item favorites, saved default recommendation preferences, and selected-menu history.
- Anonymous F1–F7 recommendation remains available without an account.
- Do not use registered-account data for advertising, unrelated profiling, or unrelated third-party disclosure.
- Logged-in users record selected-menu history when they explicitly select a menu item; anonymous users do not write history to PostgreSQL.
- Users must be able to clear selected-menu history. Do not add a separate history opt-in toggle in the first full-app pass.
- Favorites and selected-menu history keep soft-deleted menu items visible with an unavailable status, but public catalog and recommendation flows must exclude `deletedAt != null` records.
- Budget ranges such as THB 50–100 may be offered as quick-select options, but the system must not preselect a budget by default.
- Browser authentication uses JWT stored in an HTTP-only cookie.
- JWT lifetime is 7 days.
- Auth cookie flags: `HttpOnly`, `SameSite=Lax`, and `Secure` in production.
- Password hashing uses Argon2id.
- Authorization uses `USER` and `ADMIN` roles.
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
