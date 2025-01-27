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

    private async sendReminderEmail(novelStatus: INovelStatusEntity,) {
        const snapshots = this.deduplicatedSnapshots(novelStatus.snapshots)
        const latestSnapshot = getLatestNovelStatus(novelStatus)
        const toEmails = snapshots.map((snapshot) => snapshot.responsiblePersonEmail)

        this.mailService.sendReminderEmail({
            reason: latestSnapshot.reason,
            responsiblePerson: latestSnapshot.responsiblePerson,
            responsiblePersonEmail: latestSnapshot.responsiblePersonEmail,
            status: latestSnapshot.status,
            toEmails,
            createdAt: latestSnapshot.createdAt
        })
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
}

import { tags } from "typia"

export interface INovelStatusDto {
    id: string & tags.MaxLength<30>
    snapshotId: string & tags.MaxLength<30>
    reason: string & tags.MaxLength<300>
    status: NovelStatus
    responsiblePersonEmail: string & tags.Format<"email">
    responsiblePerson: string
    createdAt: Date
}

export const packedNovelStatusDto = (entity: INovelStatusEntity) => {
    const latestSnapshot = getLatestNovelStatus(entity)
    return {
        id: entity.id,
        snapshotId: latestSnapshot.id,
        reason: latestSnapshot.reason,
        status: latestSnapshot.status,
        responsiblePerson: latestSnapshot.responsiblePerson,
        responsiblePersonEmail: latestSnapshot.responsiblePersonEmail,
        createdAt: latestSnapshot.createdAt,
    } satisfies INovelStatusDto
}