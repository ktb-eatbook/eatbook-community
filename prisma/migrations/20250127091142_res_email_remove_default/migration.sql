/*
  Warnings:

  - The primary key for the `requester` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "requesterhistory" DROP CONSTRAINT "requesterhistory_requesterId_fkey";

-- AlterTable
ALTER TABLE "novelstatussnapshot" ALTER COLUMN "responsiblePersonEmail" DROP DEFAULT;

-- AlterTable
ALTER TABLE "requester" DROP CONSTRAINT "requester_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(38),
ADD CONSTRAINT "requester_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "requesterhistory" ALTER COLUMN "requesterId" SET DATA TYPE VARCHAR(38);

-- AddForeignKey
ALTER TABLE "requesterhistory" ADD CONSTRAINT "requesterhistory_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "requester"("id") ON DELETE CASCADE ON UPDATE CASCADE;
