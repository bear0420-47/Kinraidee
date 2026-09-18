# Web

Mobile-first React + TypeScript web client for the Kinraidee core workflow.

## Boundary

- Built with Vite, Tailwind CSS, React Router, TanStack Query, React Hook Form, and Zod.
- Follows `docs/02-design/design-system.md` and the approved user journey.
- Calls the API through the typed OpenAPI client only.
- Does not persist personal data in browser storage unless the specification and lawful basis approve it.
- Uses `@/` as the import alias for `src/web/src`.

Implementation rules live in `docs/03-implementation/engineering-guidelines.md`.
