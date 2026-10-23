# Catalog photos

Optional photos for the restaurants and menu items in `src/api/prisma/data/catalog/restaurants/`. `pnpm --filter api catalog:build` finds them by file name; nothing else needs editing.

- **Logo:** `assets/catalog/<restaurant-slug>/logo.png` (or `.jpg`, `.webp`).
- **Dish photo:** `assets/catalog/<restaurant-slug>/menus/<menu-slug>.png` (or `.jpg`, `.webp`).
- **Checklist:** `photo-checklist.csv` (generated) lists every dish with the exact path it expects and whether a photo is `found`, `missing`, or `hidden` (its food type is hidden from the app). The build also prints any photo whose name matches no dish, which usually means a typo.
- **Stock photos:** a dish with no file of its own uses its `photo` key's pool in `src/api/prisma/data/catalog/photos.json` (hotlinked Unsplash images, or Creative Commons photos from Wikimedia Commons and Flickr found through Openverse; never downloaded). `PHOTO-CREDITS.md` (generated) credits every photographer. A file here always wins over the pool.
- Dishes without either show the app's no-photo state. A photo is copied into local uploads by the development seed, as before.

## Rules for what may be added

- Use only photos the project may publish: taken by the team, supplied by the restaurant owner, or otherwise licensed. Never save photos from Google Maps, Grab, LINE MAN, or Wongnai.
- Check each photo for identifiable people before adding it (`rule.md`).
- Record where each restaurant's data came from, and the owner's consent, in its `source` entry. Owner consent is required before a restaurant reaches production.

The previous starter catalog's photos and their authorization record are in `_archive/`, which the build ignores.
