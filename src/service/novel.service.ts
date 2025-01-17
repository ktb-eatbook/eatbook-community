import { Injectable, Logger } from "@nestjs/common";

import { MailService } from "./mail.service";
import { 
    INovelList,
    NovelRepository, 
    IRegisterNovelArgs 
} from "../repository/novel.repository";

import { 
    getInitialRequester,
    getLatestNovelInfo,
    IInitialRequester,
    INovelEntity,
    INovelInfoSnapshotEntity, 
    NovelUCICode 
} from "../provider";

const logger: Logger = new Logger("NovelService")

@Injectable()
export class NovelService {
    constructor(
        private readonly mailService: MailService,
        private readonly novelRepository: NovelRepository,
    ){}

    public async registerNovel(args: IRegisterNovelArgs): Promise<INovelEntity> {
        const result = await this.novelRepository.registerNovel(args)
        this.sendAlertEmail(result)
        /// 소설이 등록 요청이 성공하였음을 알리는 알림 로직 추가
        return result
    }

    public async getNovelList(
        page: number,
        orderBy: "asc" | "desc",
    ): Promise<INovelList> {
        return await this.novelRepository.getNovelList(page, orderBy)
    }

    public async getNovel(id: NovelUCICode): Promise<INovelEntity> {
        return await this.novelRepository.getNovel(id)
    }

    public async deleteNovel(id: NovelUCICode): Promise<boolean> {
        const deletedNovel = await this.novelRepository.deleteNovel(id)
        // 등록 요청한 소설이 삭제되었음을 알리는 알림 로직 추가
        return deletedNovel !== undefined || deletedNovel !== null
    }

    private async sendAlertEmail(novel: INovelEntity) {
        try {
            const requester = getInitialRequester(novel.requesters)
            if(requester) {
                const novelInfo = getLatestNovelInfo(requester.novelInfo)
                await this.mailService.sendAlertEmail(
                    this.packedAlertEmailArgs(requester, novelInfo)
                )
            }
        } catch(e) {
            logger.error("소설 등록 알림 메일 송신 실패")
            logger.error(`Reason: ${e}`)
            return
        }
    }

    private packedAlertEmailArgs(
        requester: IInitialRequester,
        novelInfo: INovelInfoSnapshotEntity,
    ) {
        return {
            requester: requester.name,
            requesterEmail: requester.email,
            description: novelInfo.description,
            title: novelInfo.title,
            ref: novelInfo.ref,
            createdAt: requester.createdAt,
        }
    }
}