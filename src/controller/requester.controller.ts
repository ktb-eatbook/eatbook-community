import { Controller, Res } from "@nestjs/common";
import { TypedBody, TypedParam, TypedRoute } from "@nestia/core";
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

    @TypedRoute.Get("/:id")
    public async searchRequester(
        @TypedParam("id") id: string & tags.MaxLength<30>,
        @Res() response: Response
    ) {
        try {
            const result = await this.requesterService.searchRequester(id)
            const responseObj: SuccessResponse<IRequesterDto> = {
                data: result,
                status: 200,
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
            })
            const responseObj: SuccessResponse<IRequesterDto> = {
                data: result,
                status: 200,
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
        email: string & tags.Format<"email">
        name: string
    }
}