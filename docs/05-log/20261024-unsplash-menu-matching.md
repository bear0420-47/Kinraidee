# 2026-10-24 — Apply reviewed menu photos using the existing workflow

The owner saved an Unsplash Access Key and requested using the same approach as their friend's Git commits. Reviewed `860012c`, `b32e761` and `d2e8108`: search providers, select by eye, map IDs through photo pools, regenerate seed/checklist/credits, report Unsplash selections.

Completed 48 Unsplash queries and screened 493 candidate records (372 distinct images). Added a representative protein-salad photo to `tiramisu-salad` and a source-confirmed eggplant/minced-pork photo to `eggplant-minced-pork-on-rice`. Used the existing apply/build/report commands; one Unsplash event reported and no pending events remain. Source coverage increased from 131 to 133 of 222 visible menu items; 89 remain missing.

Matching follows the existing illustrative-photo convention: the main dish matches; portion size, serving arrangement and separately served rice are not verified. This is documented explicitly in the new evidence report. It does not justify incorrect proteins/sauces or incomplete two-dish combinations. No application module or tests changed.

Local PostgreSQL at localhost:5432 could not be reached; the optional image-only sync failed before any write. Source files are updated; running database state is unchanged. No production deployment was performed. Full sourcing decisions and previews: `evidence/unsplash-menu-matching-2026-10-24/`.
