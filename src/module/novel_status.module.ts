import { Module } from "@nestjs/common";

import { NovelStatusController } from "../controller/novel_status.controller";
import { NovelStatusService } from "../service/novel_status.service";
import { NovelStatusRepository } from "../repository/novel_status.repository";

@Module({
    providers: [
        NovelStatusService,
        NovelStatusRepository,
    ],
    controllers: [NovelStatusController],
})
export class NovelStatusModule {}