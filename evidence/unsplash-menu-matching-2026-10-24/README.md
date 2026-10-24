# Menu photo matching with the saved Unsplash key — 2026-10-24

The owner asked to inspect their friend's Git workflow and use the same solution to fill missing menu images.

## Workflow and result

- Reviewed `860012c`, `b32e761`, and `d2e8108`. The existing solution searches Unsplash and Openverse, visually selects candidate IDs into dish-key pools, hotlinks the provider image URLs, generates catalog/credit files, and reports Unsplash download events.
- The Access Key was loaded from the ignored local environment file. Neither it nor the Secret Key was printed or stored in evidence. No Secret Key was needed.
- Completed **48 Unsplash searches**, yielding **493 candidate records / 372 distinct images**, including overlaps. Search results are candidates, not automatically approved images.
- Added **two menu images**, one from Unsplash and one from Wikimedia Commons: **ทีรามิสุสลัด** and **มะเขือยาวผัดหมูสับ ราดข้าว**.
- Current source catalog: **133 / 222 visible menus with images; 89 still without images**. The prior pass had 131 / 222.
- Ran the existing `catalog-photos.ts apply`, `catalog-build.ts`, and `catalog-photos.ts report-downloads`. The one selected Unsplash image was reported successfully; the pending report queue is empty.

## Interpretation of an illustrative match

The established catalog uses illustrative stock images, not photographs verified as the restaurant's own servings. This pass follows that convention: the named main dish must match, while serving size, container, arrangement and separately served rice may differ. This refines the first research pass's overly strict full-plate rule; it does not permit changing the protein, using a different named sauce, or dropping half of a two-dish combination.

- **ทีรามิสุสลัด**: the menu description is a customizable protein salad, not tiramisu dessert. The selected Unsplash image visibly shows a grilled-chicken and vegetable salad. It represents a possible protein-salad arrangement; the exact five selected fillings, volume and restaurant recipe are not verified. Source: [Zayed Ahmed Zadu](https://unsplash.com/photos/grilled-chicken-salad-with-vegetables-and-nuts-top-view-bly5KOy6zNM), [Unsplash License](https://unsplash.com/license).
- **มะเขือยาวผัดหมูสับ ราดข้าว**: eggplant and minced pork are visible, and the original source explicitly identifies both. The image illustrates the main dish without visible rice. It is not reused for the pork-belly-plus-eggplant combination meal. Source: [Peachyeung316](https://commons.wikimedia.org/wiki/File:Hong_Kong_style_fired_Eggplant_with_minced_pork.jpg), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

Both accepted images were checked visually, contain no identifiable people or watermark, and load successfully. Provider image URLs remain hotlinked. The local evidence previews are resized, with metadata removed; the Commons preview adaptation is shared under CC BY-SA 4.0. Credits are generated in the same files and UI data as the friend's implementation.

## Rejected examples

- Unsplash `L4WylHZLl18` looked like Thai stir-fried macaroni; the creator identifies it as fusion mac and cheese. Rejected for ผัดมักกะโรนี.
- `lbaUoloKooI` looked like minced pork; the creator identifies it as gyudon beef. Rejected for pork menus.
- `8qFMa9-ljD8` was returned for salt-and-pepper wings; the creator identifies it as kung pao chicken. Rejected for ปีกไก่ทอดรสแซ่บ.
- `K9OEnvrlGUQ` is popcorn chicken over fried rice with mayonnaise. It does not establish Korean sauce, cheese, Snow White sauce or sour cream and onion. Rejected for those variants.
- Generic doner wraps do not establish Adana minced-beef kebab, liver shish kebab or saba fish fillings. Generic hot pots do not represent single-serving Thai dry suki.

## Files and local database

- `review.html`: accepted-image previews and the current remaining-menu list.
- `matched.json`: selected source metadata, menu IDs and matching rationale.
- `remaining.json`: all 89 unresolved menus.
- `search-results.json`: the 48 queries and candidate metadata; no credentials.

Before mutation, current catalog files and verification evidence were archived under `evidence/archive/20261024-before-unsplash-key-pass/`. Prior staged work was preserved.

An image-only sync was attempted for reviewed menu IDs against the configured local development database. PostgreSQL at `localhost:5432` was unreachable, including outside the sandbox. The first read failed, so **no database records were changed**. No server was started, no full database seed was run, no administrator credentials were reset, and no remote deployment occurred. The source catalog and generated seed contain the new mappings, ready for the project's normal local seed workflow once the database is available.

Validation results, including the unresolved web TypeScript configuration failure, are in `docs/verification.md`.
