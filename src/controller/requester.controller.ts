import { Controller, Res } from "@nestjs/common";
import { TypedBody, TypedParam, TypedQuery, TypedRoute } from "@nestia/core";
import { Response } from "express";
import { tags } from "typia"

import { 
    IRequesterDto, 
    RequesterService 
} from "../service/requester.service";
import { SuccessResponse } from "../common";
import { NovelUCICode } from "../provider";

@Controller("requester")
export class RequesterController {
    constructor(
        private readonly requesterService: RequesterService,
    ){}

    @TypedRoute.Get()
    public async searchRequester(
        @TypedQuery() query: Query.IGetHistoriesArgs,
        @Res() response: Response
    ) {
        try {
            const result = await this.requesterService.searchRequester(query.id)
            const responseObj: SuccessResponse<IRequesterDto> = {
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
    public async registRequester(
        @TypedBody() body: Body.IRegistRequesterArgs,
        @Res() response: Response
    ) {
        try {
            const result = await this.requesterService.registRequester({
                novelId: body.novelId,
                email: body.email,
                name: body.name,
                requesterId: body.requesterId,
            })
            const responseObj: SuccessResponse<IRequesterDto> = {
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

export namespace Body {
    export interface IRegistRequesterArgs{
        novelId: NovelUCICode
        requesterId: string & tags.MaxLength<38>
        email: string & tags.Format<"email">
        name: string
    }
}

export namespace Query {
    export interface IGetHistoriesArgs {
        id: string & tags.MaxLength<38>
    }
}