import { Injectable } from "@nestjs/common";

import { 
    getLatestNovelStatus,
    INovelStatusEntity,
    NovelStatusProvider,
} from "../provider";
import { PrismaService } from "../common/prisma";
import { ERROR } from "../common";

@Injectable()
export class NovelStatusRepository {
    public async addNovelStatusSnapshot(args: IAddNovelStatusSnapshotArgs): Promise<INovelStatusEntity> {
        return await PrismaService.client.$transaction(async tx => {
            const novelStatus = await NovelStatusProvider
            .Entity
            .findUnique({
                where: {
                    id: args.statusId,
                }
            }, tx)
            
            /// 등록 요청중인 소설이 아닐경우
            if(novelStatus === null) throw ERROR.NotFoundData
            /// 등록 요청중인 소설의 상태가 변경하려는 상태와 동일할 경우
            else if(getLatestNovelStatus(novelStatus).status === args.status) throw ERROR.Conflict

            return (await NovelStatusProvider
            .Entity
            .update({
                where: {
                    id: args.statusId,
                },
                data: {
                    snapshot: {
                        create: {
                            reason: args.reason,
                            status: args.status,
                            responsiblePerson: args.responsiblePerson,
                            responsiblePersonEmail: args.responsiblePersonEmail,
                        },
                    }
                }
            }, tx))!
        })
    }
}

export interface IAddNovelStatusSnapshotArgs {
    statusId: string
    reason: string
    status: string
    responsiblePersonEmail: string
    responsiblePerson: string
    requesterEmail: string
}