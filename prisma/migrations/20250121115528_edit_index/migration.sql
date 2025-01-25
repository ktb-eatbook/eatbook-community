-- DropIndex
DROP INDEX "novel_id_idx";

-- CreateIndex
CREATE INDEX "novel_id_deletedAt_idx" ON "novel" USING BRIN ("id", "deletedAt");
