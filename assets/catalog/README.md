# Catalog source assets

These assets support the approved issue #30 starter catalog dataset.

- Source: restaurant, menu, and image files supplied by the project owner.
- Authorization: the project owner explicitly approved repository and seed use on 2026-10-05.
- Verification date: 2026-10-05.
- Privacy review: the supplied assets show food, menu artwork, and restaurant logos; no identifiable people were found.
- Runtime handling: these are source assets only. The seed keeps `imageKey` and `imageUrl` as `null` until an approved external URL or durable application-owned storage is available.

The canonical structured fixture is `src/api/prisma/data/catalog.seed.json`. Filenames below are normalized to match their restaurant and menu records; the original root-level filenames are intentionally not retained.
