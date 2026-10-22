# Archived starter catalog assets (issue #30)

Archived on 2026-10-22 when the catalog moved to the per-restaurant source format (human approver's decision, see `docs/plan.md`). The matching records are in `src/api/prisma/data/archive/catalog.seed.2026-10-06.json`. Both are kept unchanged as the evidence below describes them, and serve as the fixture for `src/api/prisma/catalog-seed.test.ts`. The catalog build ignores this folder.

These assets support the approved issue #30 starter catalog dataset.

- Source: restaurant, menu, and image files supplied by the project owner.
- Authorization: the project owner explicitly approved repository and seed use on 2026-10-05.
- Verification date: 2026-10-05.
- Privacy review: the supplied assets show food, menu artwork, and restaurant logos; no identifiable people were found.
- Runtime handling (human approver's decision, 2026-10-06, replacing the original #30 rule):
  - With local uploads on (`LOCAL_UPLOADS_ENABLED=true`, development and test), the seed copies each photo into `LOCAL_UPLOADS_DIRECTORY` under the fixed key in its record's `image` entry, and stores `imageKey` and `imageUrl` (`/uploads/<key>`). Anyone who runs the seed sees all 3 restaurant logos and 9 menu photos.
  - With local uploads off (production), records keep their approved external `imageUrl` or `null` until durable application-owned storage is available.

The structured fixture is `src/api/prisma/data/archive/catalog.seed.2026-10-06.json`. Filenames below are normalized to match their restaurant and menu records; the original root-level filenames are intentionally not retained.
