import { TypedRoute } from "@nestia/core";
import { Controller } from "@nestjs/common";
import { MailService } from "src/service/mail.service";

@Controller("mail")
export class MailController {
    constructor(
        private mailService: MailService,
    ){}

    @TypedRoute.Post()
    async test() {
        this.mailService.sendMail({
            requester: "한강민",
            to: "rkdalsdl112@gmail.com",
            title: "테스트",
            description: "테스트",
            ref: "https://www.abstractapi.com/guides/http-status-codes"
        })
        return true
    }
}