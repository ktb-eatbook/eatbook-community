-- DropForeignKey
ALTER TABLE "novelinfo" DROP CONSTRAINT "novelinfo_requester_id_fkey";

-- DropForeignKey
ALTER TABLE "novelstatus" DROP CONSTRAINT "novelstatus_requester_id_fkey";

-- DropForeignKey
ALTER TABLE "novelstatussnapshot" DROP CONSTRAINT "novelstatussnapshot_novelstatus_id_fkey";

-- DropForeignKey
ALTER TABLE "requester" DROP CONSTRAINT "requester_novel_id_fkey";

-- AddForeignKey
ALTER TABLE "requester" ADD CONSTRAINT "requester_novel_id_fkey" FOREIGN KEY ("novel_id") REFERENCES "novel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "novelinfo" ADD CONSTRAINT "novelinfo_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "requester"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "novelstatus" ADD CONSTRAINT "novelstatus_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "requester"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "novelstatussnapshot" ADD CONSTRAINT "novelstatussnapshot_novelstatus_id_fkey" FOREIGN KEY ("novelstatus_id") REFERENCES "novelstatus"("id") ON DELETE CASCADE ON UPDATE CASCADE;
