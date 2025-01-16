-- CreateTable
CREATE TABLE "novel" (
    "id" VARCHAR NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "novel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "novelsnapshot" (
    "id" VARCHAR(30) NOT NULL,
    "novel_id" VARCHAR(30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "novelsnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requester" (
    "id" VARCHAR(30) NOT NULL,
    "novelsnapshot_id" VARCHAR(30) NOT NULL,
    "email" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,

    CONSTRAINT "requester_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "novelinfo" (
    "id" VARCHAR(30) NOT NULL,
    "novelsnapshot_id" VARCHAR(30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "novelinfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "novelinfosnapshot" (
    "id" VARCHAR(30) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" VARCHAR(200) NOT NULL DEFAULT '',
    "ref" VARCHAR NOT NULL,
    "novelinfo_id" VARCHAR(30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "novelinfosnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "novelstatus" (
    "id" VARCHAR(30) NOT NULL,
    "novelsnapshot_id" VARCHAR(30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "novelstatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "novelstatussnapshot" (
    "id" VARCHAR(30) NOT NULL,
    "novelstatus_id" VARCHAR(30) NOT NULL,
    "reason" VARCHAR NOT NULL,
    "status" VARCHAR(10) NOT NULL,
    "responsiblePersonEmail" VARCHAR NOT NULL,
    "responsiblePerson" VARCHAR NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "novelstatussnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "requester_novelsnapshot_id_key" ON "requester"("novelsnapshot_id");

-- CreateIndex
CREATE UNIQUE INDEX "novelinfo_novelsnapshot_id_key" ON "novelinfo"("novelsnapshot_id");

-- CreateIndex
CREATE UNIQUE INDEX "novelinfosnapshot_novelinfo_id_key" ON "novelinfosnapshot"("novelinfo_id");

-- CreateIndex
CREATE UNIQUE INDEX "novelstatus_novelsnapshot_id_key" ON "novelstatus"("novelsnapshot_id");

-- CreateIndex
CREATE UNIQUE INDEX "novelstatussnapshot_novelstatus_id_key" ON "novelstatussnapshot"("novelstatus_id");

-- AddForeignKey
ALTER TABLE "novelsnapshot" ADD CONSTRAINT "novelsnapshot_novel_id_fkey" FOREIGN KEY ("novel_id") REFERENCES "novel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requester" ADD CONSTRAINT "requester_novelsnapshot_id_fkey" FOREIGN KEY ("novelsnapshot_id") REFERENCES "novelsnapshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "novelinfo" ADD CONSTRAINT "novelinfo_novelsnapshot_id_fkey" FOREIGN KEY ("novelsnapshot_id") REFERENCES "novelsnapshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "novelinfosnapshot" ADD CONSTRAINT "novelinfosnapshot_novelinfo_id_fkey" FOREIGN KEY ("novelinfo_id") REFERENCES "novelinfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "novelstatus" ADD CONSTRAINT "novelstatus_novelsnapshot_id_fkey" FOREIGN KEY ("novelsnapshot_id") REFERENCES "novelsnapshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "novelstatussnapshot" ADD CONSTRAINT "novelstatussnapshot_novelstatus_id_fkey" FOREIGN KEY ("novelstatus_id") REFERENCES "novelstatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
