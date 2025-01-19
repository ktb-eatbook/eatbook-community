import { Injectable, Logger } from "@nestjs/common";

import { MailService } from "./mail.service";
import { 
    NovelRepository, 
    IRegisterNovelArgs 
} from "../repository/novel.repository";
import { 
    getLatestNovelInfo,
    INovelEntity,
    INovelInfoEntity,
    IRequesterIds,
    NovelUCICode 
} from "../provider";
import { INovelStatusDto, packedNovelStatusDto } from "./novel_status.service";
import { getLatestNovelSnapshot, INovelSnapshotEntity } from "../provider/entity/novel_snapshot.entity";

const logger: Logger = new Logger("NovelService")

@Injectable()
export class NovelService {
    constructor(
        private readonly mailService: MailService,
        private readonly novelRepository: NovelRepository,
    ){}

    public async registerNovel(args: IRegisterNovelArgs): Promise<IRegistResultDto> {
        const result = await this.novelRepository.registerNovel(args)
        this.sendAlertEmail(
            result,
            args.requesterName,
            args.requesterEmail,
        )
        /// 소설이 등록 요청이 성공하였음을 알리는 알림 로직 추가
        return {
            novel: packedNovelDtoOmitRequesters(result),
            requesterId: result.requesters[0].requesterId,
        } satisfies IRegistResultDto
    }

    public async getNovelList(
        page: number,
        orderBy: "asc" | "desc",
    ): Promise<INovelDtoList> {
        return await this.novelRepository
        .getNovelList(page, orderBy)
        .then(result => {
            const novelDtos = result.list.map(packedNovelDto)
            return { list: novelDtos, totalCount: result.totalCount }
        })
    }

    public async getNovel(id: NovelUCICode): Promise<INovelDto> {
        return await this.novelRepository
        .getNovel(id)
        .then(packedNovelDto)
    }

    public async deleteNovel(id: NovelUCICode): Promise<boolean> {
        const deletedNovel = await this.novelRepository.deleteNovel(id)
        // 등록 요청한 소설이 삭제되었음을 알리는 알림 로직 추가
        return deletedNovel !== undefined || deletedNovel !== null
    }

    private async sendAlertEmail(
        novel: INovelEntity,
        requesterName: string,
        requesterEmail: string & tags.Format<"email">
    ) {
        try {
            await this.mailService.sendAlertEmail(
                this.packedAlertEmailArgs(
                    novel,
                    requesterName,
                    requesterEmail,
                )
            )
        } catch(e) {
            logger.error("소설 등록 알림 메일 송신 실패")
            logger.error(`Reason: ${e}`)
            return
        }
    }

    private packedAlertEmailArgs(
        novel: INovelEntity,
        requesterName: string,
        requesterEmail: string & tags.Format<"email">
    ) {
        const latestSnapshot = getLatestNovelSnapshot(novel.snapshots)
        const latestNovelInfo = getLatestNovelInfo(latestSnapshot.novelInfo!)

        return {
            requester: requesterName,
            requesterEmail,
            description: latestNovelInfo.description,
            title: latestNovelInfo.title,
            ref: latestNovelInfo.ref,
            createdAt: latestSnapshot.createdAt,
        }
    }
}

import { tags } from "typia"

export interface IRegistResultDto {
    novel: Omit<INovelDto, "requesters">
    requesterId: string & tags.MaxLength<30>
}

export interface INovelDto {
    id: NovelUCICode
    novels: INovelSnapshotDto[]
    requesters: IRequesterIds[]
    createdAt: Date
    deletedAt: Date | null
}

export interface INovelSnapshotDto {
    novelInfo: INovelInfoDto | null
    novelStatus: INovelStatusDto | null
    createdAt: Date
}

export const packedNovelDto = (entity: INovelEntity) => {
    return {
        id: entity.id,
        novels: entity.snapshots.map(snapshot => packedNovelSnapshotDto(snapshot)),
        requesters: entity.requesters,
        createdAt: entity.createdAt,
        deletedAt: entity.deleteAt,
    } satisfies INovelDto
}

export const packedNovelDtoOmitRequesters = (entity: INovelEntity) => {
    return {
        id: entity.id,
        novels: entity.snapshots.map(snapshot => packedNovelSnapshotDto(snapshot)),
        createdAt: entity.createdAt,
        deletedAt: entity.deleteAt,
    } satisfies Omit<INovelDto, "requesters">
}

export const packedNovelSnapshotDto = (entity: INovelSnapshotEntity) => {
    return {
        novelInfo: entity.novelInfo ? packedNovelInfoDto(entity.novelInfo) : null,
        novelStatus: entity.novelStatus ? packedNovelStatusDto(entity.novelStatus) : null,
        createdAt: entity.createdAt,
    } satisfies INovelSnapshotDto
}

export interface INovelDtoList {
    totalCount: number
    list: INovelDto[]
}

/// ----
/// NovelInfoService가 없기 때문에 임시로 이곳에 작성
/// 추가된다면 옮겨질 코드
/// ----
export interface INovelInfoDto {
    snapshotId: string & tags.MaxLength<30>
    infoId: string & tags.MaxLength<30>
    title: string & tags.MaxLength<200>
    description: string & tags.MaxLength<200>
    ref: string & tags.Format<"url">
    createdAt: Date
}

export const packedNovelInfoDto = (entity: INovelInfoEntity) => {
    const latestInfo = getLatestNovelInfo(entity)
    return {    
        snapshotId: latestInfo.id,
        infoId: entity.id,
        title: latestInfo.title,
        description: latestInfo.description,
        ref: latestInfo.ref,
        createdAt: latestInfo.createdAt,
    } satisfies INovelInfoDto 
}
