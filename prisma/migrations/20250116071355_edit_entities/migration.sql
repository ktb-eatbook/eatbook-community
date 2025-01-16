/*
  Warnings:

  - You are about to drop the column `novelsnapshot_id` on the `novelinfo` table. All the data in the column will be lost.
  - You are about to drop the column `novelsnapshot_id` on the `novelstatus` table. All the data in the column will be lost.
  - You are about to drop the column `novelsnapshot_id` on the `requester` table. All the data in the column will be lost.
  - You are about to drop the `novelsnapshot` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[requester_id]` on the table `novelinfo` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[requester_id]` on the table `novelstatus` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[novel_id]` on the table `requester` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `requester_id` to the `novelinfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requester_id` to the `novelstatus` table without a default value. This is not possible if the table is not empty.
  - Added the required column `novel_id` to the `requester` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "novelinfo" DROP CONSTRAINT "novelinfo_novelsnapshot_id_fkey";

-- DropForeignKey
ALTER TABLE "novelsnapshot" DROP CONSTRAINT "novelsnapshot_novel_id_fkey";

-- DropForeignKey
ALTER TABLE "novelstatus" DROP CONSTRAINT "novelstatus_novelsnapshot_id_fkey";

-- DropForeignKey
ALTER TABLE "requester" DROP CONSTRAINT "requester_novelsnapshot_id_fkey";

-- DropIndex
DROP INDEX "novelinfo_novelsnapshot_id_key";

-- DropIndex
DROP INDEX "novelstatus_novelsnapshot_id_key";

-- DropIndex
DROP INDEX "requester_novelsnapshot_id_key";

-- AlterTable
ALTER TABLE "novelinfo" DROP COLUMN "novelsnapshot_id",
ADD COLUMN     "requester_id" VARCHAR(30) NOT NULL;

-- AlterTable
ALTER TABLE "novelstatus" DROP COLUMN "novelsnapshot_id",
ADD COLUMN     "requester_id" VARCHAR(30) NOT NULL;

-- AlterTable
ALTER TABLE "requester" DROP COLUMN "novelsnapshot_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "novel_id" VARCHAR(30) NOT NULL;

-- DropTable
DROP TABLE "novelsnapshot";

-- CreateIndex
CREATE UNIQUE INDEX "novelinfo_requester_id_key" ON "novelinfo"("requester_id");

-- CreateIndex
CREATE UNIQUE INDEX "novelstatus_requester_id_key" ON "novelstatus"("requester_id");

-- CreateIndex
CREATE UNIQUE INDEX "requester_novel_id_key" ON "requester"("novel_id");

-- AddForeignKey
ALTER TABLE "requester" ADD CONSTRAINT "requester_novel_id_fkey" FOREIGN KEY ("novel_id") REFERENCES "novel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "novelinfo" ADD CONSTRAINT "novelinfo_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "requester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "novelstatus" ADD CONSTRAINT "novelstatus_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "requester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
