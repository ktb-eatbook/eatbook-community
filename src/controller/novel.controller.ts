import { TypedBody, TypedQuery, TypedRoute } from "@nestia/core";
import { Controller, Res } from "@nestjs/common";
import { Response } from "express";
import { tags } from "typia"

import { NovelService } from "../service/novel.service";
import { INovelEntity, NovelUCICode } from "../provider";
import { INovelList } from "../repository/novel.repository";
import { SuccessResponse } from "../common";

@Controller("novel")
export class NovelController {
    constructor(
        private readonly novelService: NovelService,
    ){}

    @TypedRoute.Get("list")
    public async getNovelList(
        @TypedQuery() query: QueryParam.IGetNovelList,
        @Res() response: Response
    ) {
        try {
            const result = await this.novelService.getNovelList(
                query.page,
                query.orderBy,
            )
            const responseObj: SuccessResponse<INovelList> = {
                data: result,
                status: 200,
            }

            response.json(responseObj)
        } catch(e) {
            response.json(e)
        }
    }

    @TypedRoute.Get()
    public async getNovel(
        @TypedQuery() query: QueryParam.IGetNovelById,
        @Res() response: Response,
    ) {
        try {
            const result = await this.novelService.getNovel(query.id)
            const responseObj: SuccessResponse<INovelEntity> = {
                data: result,
                status: 200,
            }

            response.json(responseObj)
        } catch(e) {
            response.json(e)
        }
    }

    @TypedRoute.Post()
    public async registNovel(
        @TypedBody() body: Body.IRegistNovelArgs,
        @Res() response: Response,
    ) {
        try {
            const result = await this.novelService.registerNovel({
                id: body.id,
                novelDescription: body.novelInfo.novelDescription,
                novelTitle: body.novelInfo.novelTitle,
                ref: body.novelInfo.ref,
                requesterEmail: body.requester.requesterEmail,
                requesterName: body.requester.requesterName,
            })
            const responseObj: SuccessResponse<INovelEntity> = {
                data: result,
                status: 201
            }

            response.json(responseObj)
        } catch(e) {
            response.json(e)
        }
    }

    @TypedRoute.Delete()
    public async deleteNovel(
        @TypedQuery() query: QueryParam.IGetNovelById,
        @Res() response: Response,
    ) {
        try {
            const result = await this.novelService.deleteNovel(query.id)
            const responseObj: SuccessResponse<boolean> = {
                data: result,
                status: 200,
            }

            response.json(responseObj)
        } catch(e) {
            response.json(e)
        }
    }
}

export namespace QueryParam {
    export interface IGetNovelById {
        id: NovelUCICode
    }
    export interface IGetNovelList {
        page: number & tags.Minimum<1>
        orderBy: "desc" | "asc"
    }
}

export namespace Body {
    export interface IRegistNovelArgs {
        id: NovelUCICode
        requester: IRequesterInfoArgs
        novelInfo: INovelInfoArgs
    }

    interface IRequesterInfoArgs {
        requesterEmail: string & tags.Format<"email">
        requesterName: string
    }

    interface INovelInfoArgs {
        novelTitle: string & tags.MaxLength<200>
        novelDescription: string & tags.MaxLength<200>
        ref: string & tags.Format<"url">
    }
}