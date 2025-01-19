/*
  Warnings:

  - You are about to drop the column `requesterId` on the `requesterhistory` table. All the data in the column will be lost.
  - Added the required column `historyId` to the `requester` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "requesterhistory" DROP CONSTRAINT "requesterhistory_requesterId_fkey";

-- AlterTable
ALTER TABLE "requester" ADD COLUMN     "historyId" VARCHAR(30) NOT NULL;

-- AlterTable
ALTER TABLE "requesterhistory" DROP COLUMN "requesterId";

-- AddForeignKey
ALTER TABLE "requester" ADD CONSTRAINT "requester_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "requesterhistory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
