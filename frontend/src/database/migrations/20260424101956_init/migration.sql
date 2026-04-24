-- CreateEnum
CREATE TYPE "ScraperJobStatus" AS ENUM ('RUNNING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "MietpreisbremseVerdict" AS ENUM ('COMPLIANT', 'BORDERLINE', 'EXCEEDS_RENT_CAP');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'SUBMITTED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

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
    "mietpreisbremseVerdict" "MietpreisbremseVerdict",
    "mietpreisbremseMaxLegalPerM2" DECIMAL(65,30),
    "mietpreisbremseListingRentPerM2" DECIMAL(65,30),
    "mietpreisbremseOverpaymentPercent" DECIMAL(65,30),

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

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "whatsappNumber" TEXT,
    "name" TEXT NOT NULL,
    "monthlyNetIncomeEur" INTEGER,
    "householdSize" INTEGER NOT NULL DEFAULT 1,
    "hasPets" BOOLEAN NOT NULL DEFAULT false,
    "hasSchufa" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantPreference" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "minRooms" DECIMAL(65,30),
    "maxRooms" DECIMAL(65,30),
    "maxColdRent" DECIMAL(65,30),
    "maxWarmRent" DECIMAL(65,30),
    "minAreaM2" DECIMAL(65,30),
    "preferredDistricts" TEXT[],
    "wbsRequired" BOOLEAN,
    "autoApplyEnabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TenantPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantDocument" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "storageUrl" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenantDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "coverLetter" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP(3),
    "responseAt" TIMESTAMP(3),
    "responseContent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaitlistSignup" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WaitlistSignup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaitlistQrOpen" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WaitlistQrOpen_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Listing_mietpreisbremseVerdict_idx" ON "Listing"("mietpreisbremseVerdict");

-- CreateIndex
CREATE UNIQUE INDEX "Listing_source_sourceListingId_key" ON "Listing"("source", "sourceListingId");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_email_key" ON "Tenant"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TenantPreference_tenantId_key" ON "TenantPreference"("tenantId");

-- CreateIndex
CREATE INDEX "Notification_tenantId_createdAt_idx" ON "Notification"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_status_idx" ON "Notification"("status");

-- CreateIndex
CREATE UNIQUE INDEX "WaitlistSignup_email_key" ON "WaitlistSignup"("email");

-- CreateIndex
CREATE INDEX "WaitlistSignup_source_idx" ON "WaitlistSignup"("source");

-- CreateIndex
CREATE INDEX "WaitlistSignup_createdAt_idx" ON "WaitlistSignup"("createdAt");

-- CreateIndex
CREATE INDEX "WaitlistQrOpen_createdAt_idx" ON "WaitlistQrOpen"("createdAt");

-- AddForeignKey
ALTER TABLE "TenantPreference" ADD CONSTRAINT "TenantPreference_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantDocument" ADD CONSTRAINT "TenantDocument_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
