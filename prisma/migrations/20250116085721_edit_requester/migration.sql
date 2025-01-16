/*
  Warnings:

  - Added the required column `sequence` to the `requester` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "requester" ADD COLUMN     "sequence" INTEGER NOT NULL;
