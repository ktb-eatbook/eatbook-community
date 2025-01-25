-- DropIndex
DROP INDEX "novel_createdAt_idx";

-- CreateIndex
CREATE INDEX "novel_id_idx" ON "novel" USING BRIN ("id");
