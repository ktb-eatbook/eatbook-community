import { Injectable } from "@nestjs/common";

import { IAddRequesterArgs, RequesterRepository } from "../repository/requester.repository";
import { 
    getLatestNovelInfo,
    getLatestNovelStatus,
    INovelInfoSnapshotEntity, 
    INovelStatusSnapshotEntity, 
    IRequesterEntity, 
    NovelUCICode 
} from "../provider";

@Injectable()
export class RequesterService {
    constructor(
        private readonly requsterRepository: RequesterRepository,
    ){}

    public async searchRequester(id: string) {
        const result = await this.requsterRepository
        .findRequester(id)
        .then(this.packedRequesterDto)
        return result
    }

    public async registRequester(args: IAddRequesterArgs) {
        const result = await this.requsterRepository
        .addRequester(args)
        .then(this.packedRequesterDto)
        return result
    }

    private packedRequesterDto(entity: IRequesterEntity){
        return {
            id: entity.id,
            email: entity.email,
            name: entity.name,
            novelId: entity.novelId,
            novelInfo: entity.novelInfo ? getLatestNovelInfo(entity.novelInfo) : null,
            novelStatus: entity.novelStatus ? getLatestNovelStatus(entity.novelStatus) : null,
            sequence: entity.sequence,
            createdAt: entity.createdAt,
        } satisfies IRequesterDto
    }
}

import { tags } from "typia"

export interface IRequesterDto {
    id: string & tags.MaxLength<30>
    novelId: NovelUCICode
    email: string & tags.Format<"email">
    name: string
    novelInfo: INovelInfoSnapshotEntity | null
    novelStatus: INovelStatusSnapshotEntity | null
    sequence: number & tags.Minimum<1>
    createdAt: Date
}