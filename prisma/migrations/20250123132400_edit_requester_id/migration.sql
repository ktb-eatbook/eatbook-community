/*
  Warnings:

  - The primary key for the `requester` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "requester" DROP CONSTRAINT "requester_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(38),
ADD CONSTRAINT "requester_pkey" PRIMARY KEY ("id");
