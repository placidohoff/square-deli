-- CreateTable
CREATE TABLE "DisplaySettings" (
    "id" SERIAL NOT NULL,
    "tvModeEnabled" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DisplaySettings_pkey" PRIMARY KEY ("id")
);
