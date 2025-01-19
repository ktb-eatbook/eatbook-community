import { Injectable, Logger } from "@nestjs/common";
import { assert, TypeGuardError } from "typia"

import { 
    IAddNovelStatusSnapshotArgs, 
    NovelStatusRepository 
} from "../repository/novel_status.repository";
import { 
    getLatestNovelStatus,
    INovelStatusEntity,
    INovelStatusSnapshotEntity, 
    NovelStatus 
} from "../provider";
import { ERROR } from "../common";
import { MailService } from "./mail.service";

const logger: Logger = new Logger("NovelService")

@Injectable()
export class NovelStatusService {
    constructor(
        private readonly novelStatusRespository: NovelStatusRepository,
        private readonly mailService: MailService,
    ){}

    /// redis를 사용해서 이미 reviewed인 소설에 대한 처리가 필요
    /// 모든 상태에 대한 추적이 필요는 하지만 읽을 때 마다 reviewed일 필요는 없기 때문
    public async updateReviewStatus(args: IAddNovelStatusSnapshotArgs): Promise<INovelStatusDto> {
        try {
            assert<NovelStatus>(args.status)
            const result = await this.novelStatusRespository.addNovelStatusSnapshot(args)
            if(!result) throw ERROR.NotFoundData

            this.sendReminderEmail(result)
            return packedNovelStatusDto(result)
        } catch(e) {
            if(e instanceof TypeGuardError) {
                const error = ERROR.BadRequest
                error.metadata = `입력 형식을 다시 확인해 주세요. input: ${e.value} expect: ${e.expected}`
                throw ERROR.BadRequest
            }
            throw e
        }
    }

    /// * depreacated 에정
    private async sendReminderEmail(novelStatus: INovelStatusEntity) {
        try {
            const snapshots = this.deduplicatedSnapshots(novelStatus.snapshots)
            await Promise.all(
                snapshots.map(
                    (snapshot) => this.mailService.sendReminderEmail(
                        this.packedReminderEmailArgs(snapshot)
                    )
                )
            )
            return
        } catch(e) {
            logger.error("소설 등록 상태 변경 알림 메일 송신 실패")
            logger.error(`Reason: ${e}`)
            return
        }
    }
    
    private deduplicatedSnapshots(
        snapshots: INovelStatusSnapshotEntity[],
    ) {
        const added = {}
        const result: INovelStatusSnapshotEntity[] = []
        for(let i=0; i<snapshots.length; ++i) {
            const snapshot = snapshots[i]
            if(added[snapshot.responsiblePersonEmail]) continue
            else {
                added[snapshot.responsiblePersonEmail] = snapshot.responsiblePerson
                result.push(snapshot)
            }
        }
        return result
    }

    private packedReminderEmailArgs(
        snapshot: INovelStatusSnapshotEntity,
    ) {
        return {
            reason: snapshot.reason,
            responsiblePerson: snapshot.responsiblePerson,
            responsiblePersonEmail: snapshot.responsiblePersonEmail,
            status: snapshot.status,
            createdAt: snapshot.createdAt,
        }
    }
}

import { tags } from "typia"

export interface INovelStatusDto {
    snapshotId: string & tags.MaxLength<30>
    statusId: string & tags.MaxLength<30>
    reason: string & tags.MaxLength<300>
    status: NovelStatus
    responsiblePersonEmail: string & tags.Format<"email">
    responsiblePerson: string
    createdAt: Date
}

export const packedNovelStatusDto = (entity: INovelStatusEntity) => {
    const latestSnapshot = getLatestNovelStatus(entity)
    return {
        snapshotId: latestSnapshot.id,
        statusId: entity.id,
        reason: latestSnapshot.reason,
        status: latestSnapshot.status,
        responsiblePerson: latestSnapshot.responsiblePerson,
        responsiblePersonEmail: latestSnapshot.responsiblePersonEmail,
        createdAt: latestSnapshot.createdAt,
    } satisfies INovelStatusDto
}