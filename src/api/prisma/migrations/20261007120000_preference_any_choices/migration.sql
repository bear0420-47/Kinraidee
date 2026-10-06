-- AlterTable
ALTER TABLE "UserPreference" ADD COLUMN     "foodTypeAny" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tasteAny" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "zoneAny" BOOLEAN NOT NULL DEFAULT false;

-- A saved "any" choice never also names a record.
ALTER TABLE "UserPreference"
  ADD CONSTRAINT "UserPreference_zoneAny_check" CHECK (NOT ("zoneAny" AND "zoneId" IS NOT NULL)),
  ADD CONSTRAINT "UserPreference_foodTypeAny_check" CHECK (NOT ("foodTypeAny" AND "foodTypeId" IS NOT NULL)),
  ADD CONSTRAINT "UserPreference_tasteAny_check" CHECK (NOT ("tasteAny" AND "tasteId" IS NOT NULL));
