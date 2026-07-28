BEGIN;

ALTER TABLE "UserVerse"
RENAME TO "Verse";

ALTER TABLE "Verse"
RENAME COLUMN "userId" TO "createdById";

ALTER TABLE "Verse"
RENAME CONSTRAINT "UserVerse_pkey" TO "Verse_pkey";

ALTER TABLE "Verse"
RENAME CONSTRAINT "UserVerse_userId_fkey" TO "Verse_createdById_fkey";

ALTER INDEX "UserVerse_userId_createdAt_idx"
RENAME TO "Verse_createdById_createdAt_idx";

DROP INDEX "UserVerse_userId_nextReviewAt_idx";

CREATE TABLE "UserVerseProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "verseId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "sanskritProgress" INTEGER NOT NULL DEFAULT 0,
    "translationProgress" INTEGER NOT NULL DEFAULT 0,
    "repetitionLevel" INTEGER NOT NULL DEFAULT 0,
    "nextReviewAt" TEXT,
    "lastReviewedAt" TEXT,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserVerseProgress_pkey" PRIMARY KEY ("id")
);

INSERT INTO "UserVerseProgress" (
    "id",
    "userId",
    "verseId",
    "status",
    "sanskritProgress",
    "translationProgress",
    "repetitionLevel",
    "nextReviewAt",
    "lastReviewedAt",
    "isFavorite",
    "createdAt",
    "updatedAt"
)
SELECT
    'progress-' || "id",
    "createdById",
    "id",
    "status",
    "sanskritProgress",
    "translationProgress",
    "repetitionLevel",
    "nextReviewAt",
    "lastReviewedAt",
    "isFavorite",
    "createdAt",
    "updatedAt"
FROM "Verse";

ALTER TABLE "Verse"
DROP COLUMN "status",
DROP COLUMN "sanskritProgress",
DROP COLUMN "translationProgress",
DROP COLUMN "repetitionLevel",
DROP COLUMN "nextReviewAt",
DROP COLUMN "lastReviewedAt",
DROP COLUMN "isFavorite";

CREATE UNIQUE INDEX "UserVerseProgress_userId_verseId_key"
ON "UserVerseProgress"("userId", "verseId");

CREATE INDEX "UserVerseProgress_userId_nextReviewAt_idx"
ON "UserVerseProgress"("userId", "nextReviewAt");

ALTER TABLE "UserVerseProgress"
ADD CONSTRAINT "UserVerseProgress_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserVerseProgress"
ADD CONSTRAINT "UserVerseProgress_verseId_fkey"
FOREIGN KEY ("verseId") REFERENCES "Verse"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
