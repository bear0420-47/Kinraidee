# Archived catalog data

- `catalog.seed.2026-10-06.json`: the issue #30 starter catalog (3 restaurants, 9 menu items) with its photo links, as last seeded before the per-restaurant source format. Archived unchanged on 2026-10-22 (human approver's decision, `docs/plan.md`). Its photos are in `assets/catalog/_archive/`, with their source and authorization record.

The live catalog is generated from `src/api/prisma/data/catalog/` by `pnpm --filter api catalog:build`. These files are not seeded; they remain as evidence and as the seed-test fixture.
