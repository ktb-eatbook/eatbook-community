import { Module } from "@nestjs/common";

import { NovelStatusController } from "../controller/novel_status.controller";
import { NovelStatusRepository } from "../repository/novel_status.repository";
import { NovelStatusService } from "../service/novel_status.service";
import { MailModule } from "./mail.module";

@Module({
    imports: [MailModule],
    providers: [
        NovelStatusService,
        NovelStatusRepository,
    ],
    controllers: [NovelStatusController],
})
export class NovelStatusModule {}