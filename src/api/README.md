# API

Express 5 + TypeScript REST API for Kinraidee.

## Boundary

- Runs on Node.js with ESM, `tsx` for development, and `tsc` for builds.
- Validates API inputs with Zod at the boundary.
- Generates OpenAPI from registered Zod schemas.
- Uses PostgreSQL through Prisma and Prisma Migrate.
- Uses server-side cookie sessions and Argon2id for admin password hashing.
- Protected endpoints must verify authorization before changing or disclosing protected data.
- Logs must not include secrets, tokens, email addresses, raw GPS coordinates, or unnecessary personal data.
- Uses `@/` as the import alias for `src/api/src`.

Implementation rules live in `docs/03-implementation/engineering-guidelines.md`.
