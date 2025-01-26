import { Injectable } from "@nestjs/common";

import { IAddRequesterArgs, RequesterRepository } from "../repository/requester.repository";
import { 
    IRequesterEntity, 
    NovelUCICode 
} from "../provider";
import { INovelSnapshotDto, packedNovelSnapshotDto } from "./novel.service";
import { IRequesterHistoryEntity } from "../provider/entity/requester_history.entity";
import { getLatestNovelSnapshot } from "../provider/entity/novel_snapshot.entity";


@Injectable()
export class RequesterService {
    constructor(
        private readonly requsterRepository: RequesterRepository,
    ){}

    public async searchRequester(requesterId: string): Promise<IRequesterDto> {
        const result = await this.requsterRepository
        .findRequester(requesterId)
        .then(packedRequesterDto)
        return result
    }

    public async registRequester(args: IAddRequesterArgs): Promise<IRequesterDto> {
        const result = await this.requsterRepository
        .addRequester(args)
        .then(packedRequesterDto)
        return result
    }
}

import { tags } from "typia"

export interface IRequesterDto {
    id: string & tags.MaxLength<30>
    email: string & tags.Format<"email">
    name: string
    histories: IRequesterHistoryDto[]
}

export const packedRequesterDto = (entity: IRequesterEntity) => {
    return {
        id: entity.id,
        email: entity.email,
        name: entity.name,
        histories: entity.histories.map(history => packedRequesterHistoryDto(history)),
    } satisfies IRequesterDto
}

export interface IRequesterHistoryDto {
    id: string & tags.MaxLength<30>
    novelId: NovelUCICode
    novelSnapshot: INovelSnapshotDto
    favorites: number
    sequence: number & tags.Minimum<1>
    createdAt: Date
}

export const packedRequesterHistoryDto = (entity: IRequesterHistoryEntity) => {
    return {
        id: entity.id,
        novelId: entity.novelId,
        novelSnapshot: packedNovelSnapshotDto(
            getLatestNovelSnapshot(entity.novelSnapshots)
        ),
        favorites: entity.interestCount,
        sequence: entity.sequence,
        createdAt: entity.createdAt,
    } satisfies IRequesterHistoryDto
}