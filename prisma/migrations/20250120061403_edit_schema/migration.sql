-- CreateIndex
CREATE INDEX "novel_createdAt_idx" ON "novel" USING BRIN ("createdAt");
