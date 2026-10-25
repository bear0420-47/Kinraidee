ALTER TABLE "Restaurant" ADD COLUMN "googlePlaceId" TEXT;

CREATE UNIQUE INDEX "Restaurant_googlePlaceId_key" ON "Restaurant"("googlePlaceId");
