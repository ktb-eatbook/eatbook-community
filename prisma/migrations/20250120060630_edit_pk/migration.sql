-- DropIndex
DROP INDEX "novel_id_idx";

-- CreateIndex
CREATE INDEX "novel_createdAt_idx" ON "novel" USING BRIN ("createdAt");
