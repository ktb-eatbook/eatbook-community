import { Injectable } from "@nestjs/common";

import { 
    INovelStatusEntity,
    NovelStatusProvider,
    } from "../provider";

@Injectable()
export class NovelStatusRepository {
    public async addNovelStatusSnapshot(args: IAddNovelStatusSnapshotArgs): Promise<INovelStatusEntity | null> {
        return await NovelStatusProvider
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