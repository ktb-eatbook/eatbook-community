import { Controller, Res, UseGuards } from "@nestjs/common";
import { TypedBody, TypedRoute } from "@nestia/core";
import { Response } from "express";

import { SuccessResponse } from "../common";
import { 
    INovelStatusDto, 
    NovelStatusService 
} from "../service/novel_status.service";
import { RoleGuard } from "../guard/role.guard";

@Controller("novel/status")
export class NovelStatusController {
    constructor(
        private readonly novelStatusService: NovelStatusService,
    ){}
    
    @TypedRoute.Patch()
    @UseGuards(new RoleGuard(["ADMIN"]))
    public async updateReviewStatus(
        @TypedBody() body: Body.IUpdateReviewStatusArgs,
        @Res() response: Response,
    ) {
        try {
            const result = await this.novelStatusService.updateReviewStatus({
                reason: body.reason,
                responsiblePerson: body.responsiblePerson,
                responsiblePersonEmail: body.responsiblePersonEmail,
                status: body.status,
                statusId: body.statusId,
                requesterEmail: body.requesterEmail,
            })
            const responseObj: SuccessResponse<INovelStatusDto> = {
                data: result,
                message: "",
                statusCode: 201,
            }

            response.json(responseObj)
        } catch(e) {
            response.json(e)
        }
    }
}

import { tags } from "typia"

export namespace Body {
    export interface IUpdateReviewStatusArgs {
        statusId: string & tags.MaxLength<30>
        reason: string & tags.MaxLength<300>
        status: string
        responsiblePersonEmail: string & tags.Format<"email">
        responsiblePerson: string
        requesterEmail: string & tags.Format<"email">
    }
}