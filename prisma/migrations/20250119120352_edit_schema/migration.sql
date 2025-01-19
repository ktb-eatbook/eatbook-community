-- DropForeignKey
ALTER TABLE "requesterhistory" DROP CONSTRAINT "requesterhistory_novelId_fkey";

-- DropForeignKey
ALTER TABLE "requesterhistory" DROP CONSTRAINT "requesterhistory_requesterId_fkey";

-- AddForeignKey
ALTER TABLE "requesterhistory" ADD CONSTRAINT "requesterhistory_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "requester"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requesterhistory" ADD CONSTRAINT "requesterhistory_novelId_fkey" FOREIGN KEY ("novelId") REFERENCES "novel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
