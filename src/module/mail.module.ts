import { Module } from "@nestjs/common";
import { MailController } from "../controller/mail.controller";
import { MailService } from "../service/mail.service";

@Module({
    providers: [MailService],
    controllers: [MailController],
    exports: [MailService]
})
export class MailModule {}