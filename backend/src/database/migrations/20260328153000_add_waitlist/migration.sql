-- Waitlist email signups and QR landing telemetry

CREATE TABLE "WaitlistSignup" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WaitlistSignup_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WaitlistQrOpen" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WaitlistQrOpen_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WaitlistSignup_email_key" ON "WaitlistSignup"("email");

CREATE INDEX "WaitlistSignup_source_idx" ON "WaitlistSignup"("source");

CREATE INDEX "WaitlistSignup_createdAt_idx" ON "WaitlistSignup"("createdAt");

CREATE INDEX "WaitlistQrOpen_createdAt_idx" ON "WaitlistQrOpen"("createdAt");
