-- CreateEnum
CREATE TYPE "ScraperJobStatus" AS ENUM ('RUNNING', 'SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceListingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "coldRentAmount" DECIMAL(65,30),
    "warmRentAmount" DECIMAL(65,30),
    "priceCurrency" TEXT,
    "freeFrom" TIMESTAMP(3),
    "insertedAt" TIMESTAMP(3),
    "isWBSRequired" BOOLEAN,
    "floor" INTEGER,
    "maxFloor" INTEGER,
    "yearOfConstruction" INTEGER,
    "heatingType" TEXT,
    "energyType" TEXT,
    "energyEfficiencyClass" TEXT,
    "energyConsumptionKWhPerYear" DECIMAL(65,30),
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "areaM2" DECIMAL(65,30),
    "rooms" DECIMAL(65,30),
    "listingUrl" TEXT NOT NULL,
    "imageUrls" TEXT[],
    "features" TEXT[],
    "rawData" JSONB NOT NULL,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScraperJob" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "status" "ScraperJobStatus" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "listingsProcessed" INTEGER NOT NULL DEFAULT 0,
    "listingsUpserted" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,

    CONSTRAINT "ScraperJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Listing_source_sourceListingId_key" ON "Listing"("source", "sourceListingId");
