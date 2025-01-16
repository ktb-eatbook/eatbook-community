import { Injectable } from "@nestjs/common";

import { MailService } from "./mail.service";

@Injectable()
export class NovelService {
    constructor(
        private readonly mailService: MailService,
    ){}
}