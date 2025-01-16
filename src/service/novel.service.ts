import { Injectable, Logger } from "@nestjs/common";

import { MailService } from "./mail.service";
import { 
    INovelList,
    NovelRepository, 
    IRegisterNovelArgs 
} from "../repository/novel.repository";

import { 
    INovelEntity,
    INovelInfoEntity, 
    INovelInfoSnapshotEntity, 
    INovelStatusEntity,
    INovelStatusSnapshotEntity,
    IRequesterEntity, 
    NovelUCICode 
} from "../provider";

import { tags } from "typia"

const logger: Logger = new Logger("NovelService")

@Injectable()
export class NovelService {
    constructor(
        private readonly mailService: MailService,
        private readonly novelRepository: NovelRepository,
    ){}

    public async registerNovel(args: IRegisterNovelArgs): Promise<void> {
        const result = await this.novelRepository.registerNovel(args)
        this.sendReminderEmail(result)
        /// 소설이 등록 요청이 성공하였음을 알리는 알림 로직 추가
    }

    public async getNovelList(page: number & tags.Minimum<1>): Promise<INovelList> {
        return await this.novelRepository.getNovelList(page)
    }

    public async getNovel(id: NovelUCICode): Promise<INovelEntity> {
        return await this.novelRepository.getNovel(id)
    }

    public async deleteNovel(id: NovelUCICode): Promise<boolean> {
        const deletedNovel = await this.novelRepository.deleteNovel(id)
        // 등록 요청한 소설이 삭제되었음을 알리는 알림 로직 추가
        return deletedNovel !== undefined || deletedNovel !== null
    }

    private async sendReminderEmail(novel: INovelEntity) {
        try {
            const requester = this.getInitialRequester(novel.requesters)
            if(requester) {
                const statusInfo = this.getLatestNovelStatus(requester.novelStatus)
                const novelInfo = this.getLatestNovelInfo(requester.novelInfo)
                const responsiblePersonEmails = requester.novelStatus.snapshots.map(snapshot => snapshot.responsiblePersonEmail)
                await Promise.all(
                    responsiblePersonEmails.map(
                        async email => this.mailService.sendReminderTempleteEmail({
                            novel_id: novel.id,
                            to: email,
                            requester: requester.name,
                            title: novelInfo.title,
                            reason: statusInfo.reason,
                            responsiblePerson: statusInfo.responsiblePerson,
                            responsiblePersonEmail: statusInfo.responsiblePersonEmail,
                            status: statusInfo.status,
                            createdAt: requester.createdAt,
                        })
                    )
                )
            }
            return
        } catch(e) {
            logger.error("소설 등록 알림메일 송신 실패")
            logger.error(`Reason: ${e}`)
            return
        }
    }

    private getInitialRequester(requesters: IRequesterEntity[]): IInitialRequester | undefined {
        return requesters.find(requester => requester.sequence === 1) as IInitialRequester
    }

    private getLatestNovelInfo(novelInfo: INovelInfoEntity): INovelInfoSnapshotEntity {
        return novelInfo.snapshots.sort((a, b) => {
            if(a.createdAt > b.createdAt) return 1
            else if(a.createdAt < b.createdAt) return -1
            return 0
        })[0]
    }

    private getLatestNovelStatus(novelStatus: INovelStatusEntity): INovelStatusSnapshotEntity {
        return novelStatus.snapshots.sort((a, b) => {
            if(a.createdAt > b.createdAt) return 1
            else if(a.createdAt < b.createdAt) return -1
            return 0
        })[0]
    }
}

export interface IInitialRequester {
    id: string & tags.MaxLength<30>
    novelId: NovelUCICode
    email: string & tags.Format<"email">
    name: string
    novelInfo: INovelInfoEntity
    novelStatus: INovelStatusEntity
    sequence: number
    createdAt: Date
}