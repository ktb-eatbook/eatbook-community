/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `requester` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "requester_email_key" ON "requester"("email");
