import { TypedBody, TypedQuery, TypedRoute } from "@nestia/core";
import { Controller, Res, UseGuards } from "@nestjs/common";
import { Response } from "express";
import { tags, TypeGuardError } from "typia"

import { 
    INovelDto, 
    INovelDtoList, 
    IRegistResultDto, 
    NovelService 
} from "../service/novel.service";
import { NovelUCICode } from "../provider";
import { SuccessResponse } from "../common";
import { RoleGuard } from "../guard/role.guard";

@Controller("novel")
export class NovelController {
    constructor(
        private readonly novelService: NovelService,
    ){}

    @TypedRoute.Post("list")
    public async getNovelList(
        @TypedQuery() query: Query.IGetNovelList,
        @Res() response: Response
    ) {
        try {
            const result = await this.novelService.getNovelList(
                query.page,
                query.orderBy,
            )
            const responseObj: SuccessResponse<INovelDtoList> = {
                data: result,
                message: "",
                statusCode: 200,
            }
            
            response.json(responseObj)
        } catch(e) {
            response.json(e)
        }
    }

    @TypedRoute.Post()
    public async getNovel(
        @TypedQuery() query: Query.IGetNovelById,
        @Res() response: Response,
    ) {
        try {
            const result = await this.novelService.getNovel(query.id)
            const responseObj: SuccessResponse<INovelDto> = {
                data: result,
                message: "",
                statusCode: 200,
            }

            response.json(responseObj)
        } catch(e) {
            response.json(e)
        }
    }

    @TypedRoute.Post("regist")
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
                requesterId: body.requester.requesterId,
            })
            const responseObj: SuccessResponse<IRegistResultDto | null> = {
                data: result,
                message: "",
                statusCode: 201
            }

            response.json(responseObj)
        } catch(e) {
            /// service 레이어에서 TypeGuardError가 오는 경우는
            /// 이미 등록되어 있는 소설이기 떄문에 관심 표시처리가 되어
            /// 소설 Entity가 반환 되지 않는 경우뿐
            /// 이 경우는 요청은 정상적으로 성공한 것으로 간주
            if(e instanceof TypeGuardError) {
                response.json({
                    data: null,
                    message: "",
                    statusCode: 201,
                })
            } else {
                response.json(e)
            }
        }
    }
    
    @TypedRoute.Delete()
    @UseGuards(new RoleGuard(["ADMIN"]))
    public async deleteNovel(
        @TypedQuery() query: Query.IGetNovelById,
        @Res() response: Response,
    ) {
        try {
            const result = await this.novelService.deleteNovel(query.id)
            const responseObj: SuccessResponse<boolean> = {
                data: result,
                message: "",
                statusCode: 200,
            }

            response.json(responseObj)
        } catch(e) {
            response.json(e)
        }
    }
}

export namespace Query {
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
        requesterId: string & tags.MaxLength<38>
        requesterEmail: string & tags.Format<"email">
        requesterName: string
    }

    interface INovelInfoArgs {
        novelTitle: string & tags.MaxLength<200>
        novelDescription: string & tags.MaxLength<200>
        ref: string & tags.Format<"url">
    }
}