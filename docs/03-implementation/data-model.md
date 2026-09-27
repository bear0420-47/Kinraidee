# Data Model

## Status

Approved — schema decisions locked through 2026-09-27. This file is the source of truth for Prisma model shape until the actual `src/api/prisma/schema.prisma` is implemented.

Business workflows, endpoint behavior, permissions, and deletion flows are intentionally not defined here. Capture those in implementation issues and module specs.

## Shared API Types

### Localization

Use localized objects in API and web contracts:

```ts
type Localization = {
  th: string
  en: string
}
```

PostgreSQL stores localized values as separate columns instead of nested JSON so Prisma, indexes, constraints, sorting, and filtering stay simple.

Example mapping:

```txt
nameTh + nameEn -> name: Localization
descriptionTh + descriptionEn -> description: Localization | null
```

## Relationship Overview

```txt
Zone 1 ── many Restaurant
Restaurant 1 ── many MenuItem
FoodType 1 ── many MenuItem
MenuItem many ── many Taste through MenuItemTaste
```

## Locked Schemas

### Zone

Zones are manually managed area labels. The first full-app pass does not store latitude, longitude, or GPS-derived distance.

```prisma
model Zone {
  id            String   @id @default(cuid())
  nameTh        String   @unique
  nameEn        String   @unique
  descriptionTh String?
  descriptionEn String?
  sortOrder     Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  restaurants Restaurant[]
  userPreferences UserPreference[]
}
```

Fields:

- `id` — primary key.
- `nameTh` — Thai zone name; required and unique.
- `nameEn` — English zone name; required and unique.
- `descriptionTh` — optional Thai zone description.
- `descriptionEn` — optional English zone description.
- `sortOrder` — display order for user-facing and admin zone lists.
- `createdAt` — creation timestamp.
- `updatedAt` — last update timestamp.
- `restaurants` — Prisma inverse relation; not a physical database column.
- `userPreferences` — Prisma inverse relation to registered-user default preferences.

API/web contract:

```ts
type Zone = {
  id: string
  name: Localization
  description: Localization | null
  sortOrder: number
  createdAt: string
  updatedAt: string
}
```

### Restaurant

Restaurants are catalog containers for menu items. The app stores only the information needed to support recommendation and admin catalog management.

```prisma
model Restaurant {
  id            String   @id @default(cuid())
  nameTh        String
  nameEn        String
  descriptionTh String?
  descriptionEn String?
  phone         String?
  imageKey      String?
  imageUrl      String?
  zoneId        String
  deletedAt     DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  zone      Zone       @relation(fields: [zoneId], references: [id], onDelete: Restrict)
  menuItems MenuItem[]

  @@index([zoneId])
}
```

Fields:

- `id` — primary key.
- `nameTh` — Thai restaurant name; required and not globally unique.
- `nameEn` — English restaurant name; required and not globally unique.
- `descriptionTh` — optional Thai restaurant description.
- `descriptionEn` — optional English restaurant description.
- `phone` — optional public contact phone number.
- `imageKey` — optional Cloudflare R2 object key for an uploaded image; `null` when an approved external image URL is used instead.
- `imageUrl` — optional delivered or approved external image URL. When `imageKey` is present, this URL is derived from the R2 object delivery configuration.
- `zoneId` — foreign key to `Zone`.
- `deletedAt` — soft-delete timestamp; `null` means the restaurant is available for catalog queries and recommendations.
- `createdAt` — creation timestamp.
- `updatedAt` — last update timestamp.
- `zone` — Prisma relation to the restaurant zone.
- `menuItems` — Prisma inverse relation to menu items.

API/web contract:

```ts
type Restaurant = {
  id: string
  name: Localization
  description: Localization | null
  phone: string | null
  imageKey: string | null
  imageUrl: string | null
  zoneId: string
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}
```

### FoodType

Food types are master data for the primary category of a menu item and for the food-type choice grid.

```prisma
model FoodType {
  id        String   @id @default(cuid())
  nameTh    String   @unique
  nameEn    String   @unique
  icon      String?
  sortOrder Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  menuItems MenuItem[]
  userPreferences UserPreference[]
}
```

Fields:

- `id` — primary key.
- `nameTh` — Thai food-type name; required and unique.
- `nameEn` — English food-type name; required and unique.
- `icon` — optional icon key, not SVG or image binary data.
- `sortOrder` — display order for the food-type choice grid.
- `createdAt` — creation timestamp.
- `updatedAt` — last update timestamp.
- `menuItems` — Prisma inverse relation; not a physical database column.
- `userPreferences` — Prisma inverse relation to registered-user default preferences.

API/web contract:

```ts
type FoodType = {
  id: string
  name: Localization
  icon: string | null
  sortOrder: number
  createdAt: string
  updatedAt: string
}
```

### Taste

Tastes are master data for flavor tags. A menu item can have multiple tastes.

```prisma
model Taste {
  id        String   @id @default(cuid())
  nameTh    String   @unique
  nameEn    String   @unique
  icon      String?
  sortOrder Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  menuItems MenuItemTaste[]
  userPreferences UserPreference[]
}
```

Fields:

- `id` — primary key.
- `nameTh` — Thai taste name; required and unique.
- `nameEn` — English taste name; required and unique.
- `icon` — optional icon key, not SVG or image binary data.
- `sortOrder` — display order for the taste choice grid.
- `createdAt` — creation timestamp.
- `updatedAt` — last update timestamp.
- `menuItems` — Prisma inverse relation through `MenuItemTaste`.
- `userPreferences` — Prisma inverse relation to registered-user default preferences.

API/web contract:

```ts
type Taste = {
  id: string
  name: Localization
  icon: string | null
  sortOrder: number
  createdAt: string
  updatedAt: string
}
```

### MenuItem

Menu items are the recommendation records returned to users. Each menu item belongs to one restaurant and one primary food type, and can have multiple taste tags.

```prisma
model MenuItem {
  id            String   @id @default(cuid())
  restaurantId  String
  foodTypeId    String
  nameTh        String
  nameEn        String
  descriptionTh String?
  descriptionEn String?
  price         Int
  imageKey      String?
  imageUrl      String?
  deletedAt     DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  restaurant Restaurant      @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  foodType   FoodType        @relation(fields: [foodTypeId], references: [id], onDelete: Restrict)
  tastes     MenuItemTaste[]
  favoritedBy FavoriteMenuItem[]
  selectedInHistories RecommendationHistory[]

  @@index([restaurantId])
  @@index([foodTypeId])
  @@index([price])
}
```

Fields:

- `id` — primary key.
- `restaurantId` — foreign key to `Restaurant`.
- `foodTypeId` — foreign key to the menu item's primary `FoodType`.
- `nameTh` — Thai menu item name; required.
- `nameEn` — English menu item name; required.
- `descriptionTh` — optional Thai menu item description.
- `descriptionEn` — optional English menu item description.
- `price` — integer price in Thai baht.
- `imageKey` — optional Cloudflare R2 object key for an uploaded image; `null` when an approved external image URL is used instead.
- `imageUrl` — optional delivered or approved external image URL. When `imageKey` is present, this URL is derived from the R2 object delivery configuration.
- `deletedAt` — soft-delete timestamp; `null` means the menu item is available for catalog queries and recommendations.
- `createdAt` — creation timestamp.
- `updatedAt` — last update timestamp.
- `restaurant` — Prisma relation to the owning restaurant.
- `foodType` — Prisma relation to the primary food type.
- `tastes` — Prisma relation to taste tags through `MenuItemTaste`.
- `favoritedBy` — Prisma inverse relation to users who saved this menu item as a favorite.
- `selectedInHistories` — Prisma inverse relation to registered-user selection history.

API/web contract:

```ts
type MenuItem = {
  id: string
  restaurantId: string
  foodTypeId: string
  name: Localization
  description: Localization | null
  price: number
  imageKey: string | null
  imageUrl: string | null
  deletedAt: string | null
  tastes: Taste[]
  createdAt: string
  updatedAt: string
}
```

### MenuItemTaste

`MenuItemTaste` is a join table for the many-to-many relationship between menu items and taste tags.

```prisma
model MenuItemTaste {
  menuItemId String
  tasteId    String

  menuItem MenuItem @relation(fields: [menuItemId], references: [id], onDelete: Cascade)
  taste    Taste    @relation(fields: [tasteId], references: [id], onDelete: Restrict)

  @@id([menuItemId, tasteId])
  @@index([tasteId])
}
```

Fields:

- `menuItemId` — foreign key to `MenuItem`.
- `tasteId` — foreign key to `Taste`.
- `menuItem` — Prisma relation to the menu item.
- `taste` — Prisma relation to the taste tag.

The composite primary key prevents the same taste from being attached to the same menu item more than once.

### User

Users represent both registered meal seekers and administrators. Anonymous meal seekers do not have `User` records.

Authentication uses a short-lived JWT stored in an HTTP-only cookie. The first full-app pass does not use a database-backed login-session table.

```prisma
enum UserRole {
  USER
  ADMIN
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  role      UserRole @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  auditLogs AuditLog[]
  favoriteMenuItems FavoriteMenuItem[]
  preference UserPreference?
  recommendationHistories RecommendationHistory[]
}
```

Fields:

- `id` — primary key.
- `email` — login identifier; required and unique. The first full-app pass does not verify email ownership.
- `password` — Argon2 password hash only; never store a plain-text password.
- `role` — user authorization role; `USER` for registered meal seekers and `ADMIN` for administrators.
- `createdAt` — creation timestamp.
- `updatedAt` — last update timestamp.
- `auditLogs` — Prisma inverse relation to audit events performed by this user.
- `favoriteMenuItems` — Prisma inverse relation to menu-item favorites saved by this user.
- `preference` — optional one-to-one relation to saved default recommendation preferences.
- `recommendationHistories` — Prisma inverse relation to menu items selected by this user.

Auth storage decision:

- Store the JWT in an HTTP-only cookie.
- JWT lifetime is 7 days.
- JWT claims must include `sub`, `role`, `iat`, and `exp`.
- Registration accepts a syntactically valid unique email and password, then allows those credentials to authenticate without an email-verification step.
- Do not add `emailVerifiedAt`, verification tokens, verification emails, or verification endpoints in the first full-app pass.
- Do not create `UserSession` or `AdminSession` in the first full-app pass.
- Registered-user password change is deferred; do not add change-password APIs or screens in the first full-app pass.

Account deletion decision:

- Delete `User` records physically when an account deletion is approved.
- Deleting a user cascades `FavoriteMenuItem`, `UserPreference`, and `RecommendationHistory`.
- Deleting a user sets related `AuditLog.actorId` to `null` so catalog audit evidence survives without retaining the account row.
- Do not soft-delete users in the first full-app pass.

Administrator provisioning decision:

- The first full-app pass has only the administrator account created by the approved seed process from environment-provided credentials.
- Public registration always creates `USER`; clients cannot submit or select a role.
- Do not implement admin creation, invitation, role promotion, role demotion, or admin user-management APIs/screens.
- Do not add additional administrators through manual database edits or maintenance flows in the first full-app pass.
- Do not implement an administrator password-change or password-reset flow. The seeded administrator credentials are provisioned during initial setup only.

### FavoriteMenuItem

Registered users can save menu items as favorites. Restaurants are not directly favoritable.

```prisma
model FavoriteMenuItem {
  userId     String
  menuItemId String
  createdAt  DateTime @default(now())

  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  menuItem MenuItem @relation(fields: [menuItemId], references: [id], onDelete: Cascade)

  @@id([userId, menuItemId])
  @@index([menuItemId])
}
```

Fields:

- `userId` — foreign key to the registered user.
- `menuItemId` — foreign key to the saved menu item.
- `createdAt` — timestamp when the favorite was saved.
- `user` — Prisma relation to the user.
- `menuItem` — Prisma relation to the menu item.

The composite primary key prevents a user from saving the same menu item more than once. Soft-deleting a menu item does not remove its favorite rows because the menu item remains in the database.

Soft-deleted favorite behavior:

- Favorite lists keep soft-deleted menu items visible with an unavailable status.
- Soft-deleted favorite menu items cannot be selected for recommendation or public catalog actions.
- Users can remove soft-deleted menu items from favorites.

### UserPreference

Registered users can save one set of default recommendation-form values. This model does not store allergies, food exclusions, health information, religious information, recommendation history, or rejected menu-item IDs.

```prisma
model UserPreference {
  id         String   @id @default(cuid())
  userId     String   @unique
  zoneId     String?
  foodTypeId String?
  tasteId    String?
  minPrice   Int?
  maxPrice   Int?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  zone     Zone?     @relation(fields: [zoneId], references: [id], onDelete: SetNull)
  foodType FoodType? @relation(fields: [foodTypeId], references: [id], onDelete: SetNull)
  taste    Taste?    @relation(fields: [tasteId], references: [id], onDelete: SetNull)

  @@index([zoneId])
  @@index([foodTypeId])
  @@index([tasteId])
}
```

### RecommendationHistory

Registered-user history stores only menu items that the user explicitly selects. It does not store every displayed shortlist, rejected menu-item ID, or full recommendation-session conditions.

History behavior decision:

- Logged-in users automatically record a history row when they explicitly select a menu item.
- Anonymous users never write recommendation history to PostgreSQL.
- Registration/account notice must disclose selected-menu history as an account feature.
- Users can clear their selected-menu history.
- Account deletion cascades all selected-menu history.
- Do not add a separate history opt-in toggle in the first full-app pass.
- If a selected menu item is soft-deleted later, history keeps the row visible with an unavailable status.
- Soft-deleted history items cannot be reused as active recommendation choices.

```prisma
model RecommendationHistory {
  id         String   @id @default(cuid())
  userId     String
  menuItemId String
  selectedAt DateTime @default(now())

  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  menuItem MenuItem @relation(fields: [menuItemId], references: [id], onDelete: Cascade)

  @@index([userId, selectedAt])
  @@index([menuItemId])
}
```

Fields:

- `id` — primary key.
- `userId` — foreign key to the registered user.
- `menuItemId` — foreign key to the selected menu item.
- `selectedAt` — timestamp when the user selected the menu item.
- `user` — Prisma relation to the user.
- `menuItem` — Prisma relation to the selected menu item.

API/web contract:

```ts
type RecommendationHistory = {
  id: string
  menuItemId: string
  selectedAt: string
}
```

Fields:

- `id` — primary key.
- `userId` — unique foreign key; each registered user has at most one preference set.
- `zoneId` — optional default zone.
- `foodTypeId` — optional default food type.
- `tasteId` — optional default taste; the current recommendation flow selects one taste.
- `minPrice` — optional default minimum price in Thai baht.
- `maxPrice` — optional default maximum price in Thai baht.
- `createdAt` — creation timestamp.
- `updatedAt` — last update timestamp.

API/web contract:

```ts
type UserPreference = {
  zoneId: string | null
  foodTypeId: string | null
  tasteId: string | null
  minPrice: number | null
  maxPrice: number | null
}
```

## Recommendation Session State

Recommendation-session state is not persisted in PostgreSQL.

- Anonymous and logged-in users use the same session-only recommendation flow.
- The web client keeps current conditions and rejected menu-item IDs in session memory.
- Closing the tab may discard the current recommendation state.
- Each recommendation request sends its conditions and rejected menu-item IDs to the API.
- The recommendation API remains stateless and does not create anonymous session records.
- Registered-user preferences are persistent data and use a separate schema.

Do not create `RecommendationSession`, `SessionTaste`, or `SessionRejectedMenuItem` models for this flow.

### AuditLog

Audit logs record protected catalog mutations in a minimized but reviewable form. They are application audit logs, not Computer Crime Act traffic logs.

Retention decision:

- Keep application audit logs for 180 days.
- Delete audit logs older than 180 days through a scheduled maintenance job or manual admin maintenance command.
- This retention rule does not satisfy Computer Crime Act traffic-log duties if LR10 later applies; traffic logs require a separate schema and retention decision.

Access decision:

- Only `ADMIN` users can view application audit logs.
- Audit-log API responses may include `actorId`, but must not include actor email in the first full-app pass.
- Viewing audit logs does not create another audit-log event.

```prisma
enum AuditAction {
  CREATE
  UPDATE
  DELETE
}

enum AuditEntityType {
  ZONE
  RESTAURANT
  FOOD_TYPE
  TASTE
  MENU_ITEM
}

model AuditLog {
  id         String          @id @default(cuid())
  actorId    String?
  action     AuditAction
  entityType AuditEntityType
  entityId   String
  before     Json?
  after      Json?
  requestId  String
  createdAt  DateTime        @default(now())

  actor User? @relation(fields: [actorId], references: [id], onDelete: SetNull)

  @@index([actorId])
  @@index([entityType, entityId])
  @@index([requestId])
  @@index([createdAt])
}
```

Fields:

- `id` — primary key.
- `actorId` — user who performed the mutation; set to `null` if the account is hard-deleted.
- `action` — mutation type: `CREATE`, `UPDATE`, or `DELETE`.
- `entityType` — mutated catalog entity type.
- `entityId` — mutated record ID; not a foreign key so the audit entry survives entity deletion.
- `before` — sanitized snapshot before the mutation.
- `after` — sanitized snapshot after the mutation.
- `requestId` — request identifier generated by API request-id middleware.
- `createdAt` — audit event timestamp.
- `actor` — optional Prisma relation to the acting user.

Snapshot shape:

```txt
CREATE -> before = null, after = new sanitized record
UPDATE -> before = old sanitized record, after = new sanitized record
DELETE -> before = old sanitized record, after = null
```

Audit snapshots must never contain passwords, JWTs, cookies, authentication secrets, or unnecessary sensitive personal data. Do not store IP address or user agent in this model.

## Deferred Sensitive And Historical Data

Persistent food exclusions and detailed recommendation telemetry require additional decisions before implementation.

- Do not persist allergies, food exclusions, health information, religious information, rejected menu-item IDs, displayed shortlist records, or full recommendation-session conditions until their separate schemas and privacy rules are approved.
- Reconsider persistent exclusions only after the sensitive-data assessment and the purpose, lawful basis, retention, access, and deletion decisions are approved.

## Explicit Non-Fields

Do not add these fields to locked catalog schemas unless a later approved issue changes this file first:

- Restaurant latitude or longitude.
- User GPS storage.
- Database-backed auth session tables.
- Delivery fee, rating, opening hours, calories, or external provider data.
- Image binary/blob columns.

Images are stored in Cloudflare R2. Models store the resulting object key and delivered URL, never binary image data.

- Admin input may use an approved external image URL instead of uploading; in that case `imageKey` is `null`.
- Soft-deleting a restaurant or menu item does not delete its R2 object because the catalog record remains stored and may still appear as unavailable in account history/favorites.
- Replacing an uploaded image must update the database reference safely before removing the superseded R2 object.

## Soft Deletion

- `Restaurant` and `MenuItem` use `deletedAt` for soft deletion.
- `deletedAt = null` means the record is available for normal catalog queries and recommendations.
- A non-null `deletedAt` excludes the record from public catalog queries and recommendations.
- Normal admin deletion updates `deletedAt`; it does not permanently delete the record.
- Other catalog models do not have lifecycle-status fields.

## Pending Schemas

These schemas are not locked yet:

None.

Consent evidence and traffic-retention schemas remain deferred until their legal activation conditions are explicitly approved.
