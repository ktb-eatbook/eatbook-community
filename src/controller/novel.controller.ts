import { TypedRoute } from "@nestia/core";
import { Controller } from "@nestjs/common";
import { MailService } from "../service/mail.service";

@Controller("novel")
export class NovelController {
    constructor(
        private mailService: MailService,
    ){}

    // @TypedRoute.Post()
    // public async test() {
    //     this.mailService.sendStatusMail({
    //         novel_id: "G905-11262592",
    //         title: "코스모스-5",
    //         requester: "한강민",
    //         to: "rkdalsdl112@gmail.com",
    //         responsiblePerson: "한강민",
    //         responsiblePersonEmail: "rkdalsdl112@gmail.com",
    //         reason: "확인 함",
    //         status: "reviewed",
    //         createdAt: new Date("2025-01-15")
    //     })
    //     this.mailService.sendAlertMail({
    //         title: "코스모스-5",
    //         requester: "한강민",
    //         to: "rkdalsdl112@gmail.com",
    //         createdAt: new Date("2025-01-15"),
    //         description: "줄거리임",
    //         ref: "https://gongu.copyright.or.kr/gongu/wrt/wrt/view.do?wrtSn=11262592&menuNo=200019"
    //     })
    //     return true
    // }
}