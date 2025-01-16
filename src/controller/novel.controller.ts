import { TypedParam, TypedQuery, TypedRoute } from "@nestia/core";
import { Controller, Res } from "@nestjs/common";
import { tags } from "typia"

import { MailService } from "../service/mail.service";
import { NovelService } from "../service/novel.service";
import { NovelUCICode } from "../provider";
import { Response } from "express";

@Controller("novel")
export class NovelController {
    constructor(
        private readonly mailService: MailService,
        private readonly novelService: NovelService,
    ){}

    @TypedRoute.Get("list/:page")
    public async getNovelList(
        @TypedParam("page") page: number & tags.Minimum<1>,
        @Res() response: Response
    ) {
        try {
            const result = await this.novelService.getNovelList(page)
            response.json(result)
        } catch(e) {
            response.json(e)
        }
    }

    @TypedRoute.Get()
    public async getNovel(
        @TypedQuery() query: QueryParam.GetNovelById,
        @Res() response: Response,
    ) {
        try {
            const result = await this.novelService.getNovel(query.id)
            response.json(result)
        } catch(e) {
            response.json(e)
        }
    }
}

export namespace QueryParam {
    export interface GetNovelById {
        id: NovelUCICode
    }
}