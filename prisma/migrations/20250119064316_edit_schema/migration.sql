/*
  Warnings:

  - You are about to drop the column `createdAt` on the `requester` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "requester" DROP COLUMN "createdAt";

-- AlterTable
ALTER TABLE "requesterhistory" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
