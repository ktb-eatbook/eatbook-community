import { Module } from "@nestjs/common";

import { NovelService } from "../service/novel.service";
import { NovelController } from "../controller/novel.controller";

import { MailModule } from "./mail.module";
import { MailService } from "../service/mail.service";
import { NovelRepository } from "../repository/novel.repository";
import { RequesterRepository } from "../repository/requester.repository";

@Module({
    imports: [MailModule],
    providers: [
        NovelService,
        NovelRepository,
        MailService,
        RequesterRepository,
    ],
    controllers: [NovelController],
})
export class NovelModule {}