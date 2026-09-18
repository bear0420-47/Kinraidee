# Module Implementation Checklist

Use this checklist before adding or changing any feature module. It exists to keep AI-assisted implementation traceable, minimal, and consistent with the approved workflow.

This file is the required module gate. If an agent is asked to implement a module, it must read this file first, complete the scope check, and stop when any required answer is missing.

## Required Reading

Read these files before editing module code:

- `AGENTS.md`
- `rule.md`
- `docs/plan.md`
- Current specification under `docs/01-requirements/01-spec/`
- `docs/01-requirements/backlog.md`
- `docs/03-implementation/engineering-guidelines.md`
- This checklist

Do not implement a module unless its scope maps to an approved requirement, backlog item, legal requirement, or approved design artifact.

## Required Output

Before editing module files, write a short implementation note in the active plan, issue, or PR description with this format:

```txt
Module:
Requirement/backlog ID:
Legal requirement ID:
Design artifact:
API routes:
Web pages:
Personal data:
Authorization:
Tests:
```

Use `N/A` only when the approved docs prove the item does not apply. Do not use `TBD` inside implementation work; stop and ask the human instead.

## 1. Identify The Scope

Record the implementation target before writing code:

- Requirement ID or backlog ID:
- Legal requirement ID, if applicable:
- Design artifact, if applicable:
- Module name:
- Public route or protected route:
- Personal data involved:
- Authorization requirement:
- Retention/deletion requirement:

If any item above is unknown and cannot be inferred from the approved docs, stop and ask the human.

## 2. Choose Module Location

API modules live under:

```txt
src/api/src/modules/<module>/
```

Web page code lives under:

```txt
src/web/src/pages/<page>/
```

Web shared infrastructure lives under:

```txt
src/web/src/api/
src/web/src/lib/
src/web/src/components/
src/web/src/hooks/
src/web/src/schemas/
```

Use shared folders only after real reuse exists. Do not create shared code for future reuse.

## 3. API Module Files

Create only the files the module needs:

```txt
<module>.routes.ts
<module>.controller.ts
<module>.dto.ts
<module>.service.ts
<module>.repository.ts
<module>.helpers.ts
<module>.openapi.ts
<module>.types.ts
```

Rules:

- Use `<module>.<layer>.ts` naming.
- Use plural or domain module folder names.
- Use `kebab-case` for compound module folder names.
- Add `.types.ts` only when inferred Zod/Prisma types are hard to read.
- Add `.helpers.ts` only when pure helper extraction keeps the service easier to read.

## 4. API Layer Responsibilities

- `routes`: endpoint paths and middleware only.
- `controller`: parse request with DTO, call service, return via response helpers.
- `dto`: Zod schemas, parsing helpers, response schemas, and response mapping.
- `service`: business flow and use-case decisions.
- `repository`: Prisma access only.
- `helpers`: module-local pure functions only.
- `openapi`: module OpenAPI registration function only.

Do not put business logic in routes, controllers, repositories, shared helpers, or OpenAPI files.

## 5. API Composition Rules

Register module routes in:

```txt
src/api/src/routes.ts
```

Do not import feature modules directly in:

```txt
src/api/src/app.ts
```

`app.ts` must only wire global middleware, `/health`, `routes`, and `errorHandler`.

Register module OpenAPI definitions in:

```txt
src/api/src/openapi/registry.ts
```

Do not put endpoint schemas or route definitions inline in `openapi/registry.ts`. A module must expose a registration function from `<module>.openapi.ts`.

Example pattern:

```ts
// modules/recommendations/recommendations.openapi.ts
export function registerRecommendationsOpenApi(registry: OpenAPIRegistry) {
  // register schemas and paths here
}
```

```ts
// openapi/registry.ts
registerRecommendationsOpenApi(registry)
```

## 6. API Safety Rules

- Validate every request input at the boundary with Zod.
- Protected endpoints must verify authorization before data is changed or disclosed.
- Throw `HttpError` for expected errors.
- Return success responses through `ok`, `created`, or `noContent` only.
- Never handwrite success or error envelopes in controllers.
- Do not log secrets, tokens, email addresses, raw GPS coordinates, full request bodies, or unnecessary personal data.
- Do not store raw GPS by default.
- Do not add persistent personal-data fields unless lawful basis, retention, access role, and deletion behavior are approved.

## 7. Web Module Rules

- Add pages only when the approved backlog requires a user-facing screen.
- Keep page-local components under `pages/<page>/components/`.
- Move components to root `components/` only after at least two pages use them.
- API calls must go through the typed OpenAPI client.
- TanStack Query hooks own API call orchestration.
- Components must not call `fetch` or the API client directly.
- Use Tailwind CSS by default.
- Custom CSS is allowed only when Tailwind cannot express the behavior clearly.
- Do not persist personal data in browser storage unless approved.

## 8. Tests

Add focused tests for module behavior:

- DTO validation tests for valid, invalid, and boundary inputs.
- Service tests for business rules.
- Repository tests only when DB behavior is implemented and a test database strategy exists.
- Web tests only after QA selects the component/E2E testing approach, unless a small pure-schema or pure-helper test is enough.

Do not modify tests only to make them pass.

## 9. Verification

Run these after implementation:

```sh
pnpm verify
pnpm format
node tests/wireframe-requirements.test.cjs
```

Record exact results in:

```txt
docs/verification.md
```

## 10. Stop Conditions

Stop and ask the human if:

- The module has no approved requirement or backlog item.
- Legal applicability is conditional and not decided.
- A role or permission decision is missing.
- A new personal-data field needs lawful basis or retention approval.
- A dependency upgrade is needed outside the approved stack.
- The implementation would require changing the core workflow beyond approved scope.
