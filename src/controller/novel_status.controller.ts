import { Controller, Res } from "@nestjs/common";
import { TypedBody, TypedRoute } from "@nestia/core";
import { Response } from "express";

import { NovelStatusService } from "../service/novel_status.service";

@Controller("novel/status")
export class NovelStatusController {
    constructor(
        private readonly novelStatusService: NovelStatusService,
    ){}

    @TypedRoute.Post()
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
            })
            const responseObj: SuccessResponse<INovelStatusSnapshotEntity> = {
                data: result,
                status: 201,
            }

            response.json(responseObj)
        } catch(e) {
            response.json(e)
        }
    }
}

import { tags } from "typia"
import { SuccessResponse } from "src/common";
import { INovelStatusSnapshotEntity } from "src/provider";

export namespace Body {
    export interface IUpdateReviewStatusArgs {
        statusId: string & tags.MaxLength<30>
        reason: string & tags.MaxLength<300>
        status: string
        responsiblePersonEmail: string & tags.Format<"email">
        responsiblePerson: string
    }
}