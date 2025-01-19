/*
  Warnings:

  - You are about to drop the column `historyId` on the `requester` table. All the data in the column will be lost.
  - Added the required column `requesterId` to the `requesterhistory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "requester" DROP CONSTRAINT "requester_historyId_fkey";

-- AlterTable
ALTER TABLE "requester" DROP COLUMN "historyId";

-- AlterTable
ALTER TABLE "requesterhistory" ADD COLUMN     "requesterId" VARCHAR(30) NOT NULL;

-- AddForeignKey
ALTER TABLE "requesterhistory" ADD CONSTRAINT "requesterhistory_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "requester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
