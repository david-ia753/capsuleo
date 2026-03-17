/*
  Warnings:

  - You are about to drop the column `type` on the `UploadedFile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Module" ADD COLUMN "objective" TEXT;
ALTER TABLE "Module" ADD COLUMN "shortDescription" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UploadedFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'COURS',
    "path" TEXT NOT NULL,
    "extractedText" TEXT,
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "moduleId" TEXT,
    CONSTRAINT "UploadedFile_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_UploadedFile" ("createdAt", "extractedText", "filename", "id", "isProcessed", "mimeType", "moduleId", "originalName", "path", "size", "updatedAt") SELECT "createdAt", "extractedText", "filename", "id", "isProcessed", "mimeType", "moduleId", "originalName", "path", "size", "updatedAt" FROM "UploadedFile";
DROP TABLE "UploadedFile";
ALTER TABLE "new_UploadedFile" RENAME TO "UploadedFile";
CREATE INDEX "UploadedFile_moduleId_idx" ON "UploadedFile"("moduleId");
CREATE INDEX "UploadedFile_category_idx" ON "UploadedFile"("category");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
