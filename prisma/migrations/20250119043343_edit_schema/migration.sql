/*
  Warnings:

  - You are about to drop the column `requester_id` on the `novelinfo` table. All the data in the column will be lost.
  - You are about to drop the column `requester_id` on the `novelstatus` table. All the data in the column will be lost.
  - You are about to drop the column `novel_id` on the `requester` table. All the data in the column will be lost.
  - You are about to drop the column `sequence` on the `requester` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[novelSnapshotId]` on the table `novelinfo` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[novelSnapshotId]` on the table `novelstatus` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `novelSnapshotId` to the `novelinfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `novelSnapshotId` to the `novelstatus` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "novelinfo" DROP CONSTRAINT "novelinfo_requester_id_fkey";

-- DropForeignKey
ALTER TABLE "novelstatus" DROP CONSTRAINT "novelstatus_requester_id_fkey";

-- DropForeignKey
ALTER TABLE "requester" DROP CONSTRAINT "requester_novel_id_fkey";

-- DropIndex
DROP INDEX "novelinfo_requester_id_key";

-- DropIndex
DROP INDEX "novelstatus_requester_id_key";

-- DropIndex
DROP INDEX "requester_email_idx";

-- AlterTable
ALTER TABLE "novelinfo" DROP COLUMN "requester_id",
ADD COLUMN     "novelSnapshotId" VARCHAR(30) NOT NULL;

-- AlterTable
ALTER TABLE "novelstatus" DROP COLUMN "requester_id",
ADD COLUMN     "novelSnapshotId" VARCHAR(30) NOT NULL;

-- AlterTable
ALTER TABLE "requester" DROP COLUMN "novel_id",
DROP COLUMN "sequence";

-- CreateTable
CREATE TABLE "novelsnapshot" (
    "id" VARCHAR(30) NOT NULL,
    "novel_id" VARCHAR(30) NOT NULL,

    CONSTRAINT "novelsnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requesterhistory" (
    "id" VARCHAR(30) NOT NULL,
    "novelId" VARCHAR(30) NOT NULL,
    "historyId" VARCHAR(30) NOT NULL,
    "sequence" INTEGER NOT NULL,

    CONSTRAINT "requesterhistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "novelinfo_novelSnapshotId_key" ON "novelinfo"("novelSnapshotId");

-- CreateIndex
CREATE UNIQUE INDEX "novelstatus_novelSnapshotId_key" ON "novelstatus"("novelSnapshotId");

-- AddForeignKey
ALTER TABLE "novelsnapshot" ADD CONSTRAINT "novelsnapshot_novel_id_fkey" FOREIGN KEY ("novel_id") REFERENCES "novel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requesterhistory" ADD CONSTRAINT "requesterhistory_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "requester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requesterhistory" ADD CONSTRAINT "requesterhistory_novelId_fkey" FOREIGN KEY ("novelId") REFERENCES "novel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "novelinfo" ADD CONSTRAINT "novelinfo_novelSnapshotId_fkey" FOREIGN KEY ("novelSnapshotId") REFERENCES "novelsnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "novelstatus" ADD CONSTRAINT "novelstatus_novelSnapshotId_fkey" FOREIGN KEY ("novelSnapshotId") REFERENCES "novelsnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
