CREATE TABLE "UserVerse" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookTitle" TEXT NOT NULL,
    "chapter" TEXT,
    "verseNumber" TEXT NOT NULL,
    "sanskritCyrillic" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "sanskritProgress" INTEGER NOT NULL DEFAULT 0,
    "translationProgress" INTEGER NOT NULL DEFAULT 0,
    "repetitionLevel" INTEGER NOT NULL DEFAULT 0,
    "nextReviewAt" TEXT,
    "lastReviewedAt" TEXT,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserVerse_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "UserVerse_userId_createdAt_idx" ON "UserVerse"("userId", "createdAt");
CREATE INDEX "UserVerse_userId_nextReviewAt_idx" ON "UserVerse"("userId", "nextReviewAt");

ALTER TABLE "UserVerse"
ADD CONSTRAINT "UserVerse_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
