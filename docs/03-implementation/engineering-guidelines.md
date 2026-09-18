# Engineering Guidelines

This file is the implementation guardrail for Kinraidee. It records approved stack decisions and coding rules so AI agents implement planned work consistently instead of inventing structure or dependencies.

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
      recommendations/
        recommendations.routes.ts
        recommendations.controller.ts
        recommendations.dto.ts
        recommendations.service.ts
        recommendations.repository.ts
        recommendations.helpers.ts
      sessions/
        sessions.dto.ts
        sessions.service.ts
        sessions.repository.ts
      admin-menu/
        admin-menu.routes.ts
        admin-menu.controller.ts
        admin-menu.dto.ts
        admin-menu.service.ts
        admin-menu.repository.ts
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
modules/sessions/sessions.repository.ts
modules/admin-menu/admin-menu.controller.ts
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
- Code that touches DB, sessions, or auth must not live in generic shared helpers.

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
- Use `credentials: true` for cookie sessions.
- Never use wildcard CORS origin with credentials.
- Use `cookie-parser` for session cookies.
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

- Public meal workflow uses anonymous session cookies.
- Admin authentication uses email/password.
- Sessions are server-side sessions.
- Session data is stored in PostgreSQL through Prisma.
- Cookie flags: `HttpOnly`, `SameSite=Lax`, and `Secure` in production.
- Password hashing uses Argon2id.
- JWT is not used for browser authentication.
- Authorization roles and permissions are TBA by business rules.
- Protected API routes must include authorization checks.
- Do not assume or hardcode a role model before the business rules are approved.
- Auth tokens must not be stored in `localStorage`.

## Database Rules

- Prisma schema lives under `src/api/prisma/`.
- Prisma migrations are required once DB schema exists.
- Use Prisma Client for database access.
- Avoid raw SQL unless Prisma cannot express the query clearly.
- Schema changes must trace to requirement, backlog, or legal IDs.
- Do not store raw GPS coordinates by default.
- Retention behavior must match `rule.md`.
- Seed data must not contain real personal data.

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
SESSION_SECRET=
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
