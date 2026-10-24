# Additional free food photos — 2026-10-24

Added three reviewed illustrative stock-image mappings to previously empty photo pools. Coverage increased from 133/222 to 136/222 visible menus; 86 remain unresolved. Existing image mappings were retained. See [visual review](review.html), [accepted sources](matched.json), [remaining menus](remaining.json), and [33 completed Openverse searches](search-results.json). Five additional Openverse queries timed out; no result is treated as approved automatically.

| Menu | Source and creator | License | Accuracy limits |
|---|---|---|---|
| ข้าวไข่เจียว (2 ฟอง) | [Pexels 35049888](https://www.pexels.com/photo/thai-omelette-with-heart-shaped-rice-on-rustic-table-35049888/), UNDO KIM | [Pexels License](https://www.pexels.com/license/) | Thai omelette and white rice pictured; separate rice bowl, egg count and restaurant portion unverified. |
| ข้าวทอดกระเทียม | [Mu thot krathiam](https://commons.wikimedia.org/wiki/File:Mu_thot_krathiam.jpg), Takeaway | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | Fried pork with garlic; rice not pictured. |
| ข้าวหน้ากุ้งดอง | [Ganjang-saeu-jang](https://commons.wikimedia.org/wiki/File:Ganjang-saeu-jang.jpg), eommina | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | Soy-marinated raw shrimp with shells and heads; rice and restaurant toppings not pictured. Commons records the historical CC0 release of [Pixabay photo 1534331](https://pixabay.com/photo-1534331/). |

All selected images were visually inspected and their applied URLs returned HTTP 200. These are representative dishes, not photographs of these restaurants. No face, watermark, API credential or user data was added. Source images remain hotlinked. Local review previews are resized with metadata removed; preview-2.jpg is a resized adaptation of Takeaway's CC BY-SA 3.0 photograph and is distributed under that same license. Other previews retain their source licenses above.

Additional sites reviewed: Pexels, Pixabay (via its historically licensed Commons mirror), StockSnap, Wikimedia Commons and Flickr via Openverse; nnaw8 free-image articles were also examined. Unselected candidates had a different dish, uncertain protein/sauce, visible AI watermark, or insufficiently clear permission. No third-party Thai publisher images were applied. No account or API key was required for these selected public image URLs.

Pexels support uses a native metadata schema with approved image/source hosts, matching image ID, and creator/license credits. It is not represented as an Unsplash or Openverse record. Existing stock-image consumers now recognize images.pexels.com and display its existing credit presentation. Provider tests cover malformed URLs, mismatched IDs, missing creator and stock-host classification.

Requirements and the core workflow remain unchanged; the maintenance scope is documented in docs/plan.md. Prior approved evidence is archived in evidence/archive/20261024-before-other-free-photos/. Only source catalog data and generated artifacts were updated; no database seed or deployment occurred. The local database was unavailable in the prior pass, so running database-backed screens will require an image-only sync when that database is available.
