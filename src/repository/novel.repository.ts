import { Injectable } from "@nestjs/common";

import { 
    INovelEntity,
    INovelStatusSnapshotEntity,
    NovelProvider, 
    NovelUCICode 
} from "../provider";

@Injectable()
export class NovelRepository {
    public async registerNovel(args: IRegisterNovelArgs): Promise<INovelEntity> {
        return await NovelProvider
        .Entity
        .create({
            data: {
                id: args.id,
                requesters: {
                    create: {
                        email: args.requesterEmail,
                        name: args.requesterName,
                        sequence: 1,
                        info: {
                            create: {
                                snapshot: {
                                    create: {
                                        title: args.novelTitle,
                                        description: args.novelDescription,
                                        ref: args.ref,
                                    }
                                }
                            }
                        },
                        status: {
                            create: {
                                snapshot: {
                                    create: {
                                        reason: "미확인"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })
    }

    public async getNovelList(
        page: number,
        orderBy: "asc" | "desc",
    ): Promise<INovelList> {
        return await PrismaService
        .client
        .$transaction(async tx => {
            const list = await NovelProvider
            .Entity
            .findMany({
                skip: (page - 1) * 10,
                take: page * 10,
                where: {
                    deletedAt: null,
                },
                orderBy: {
                    createdAt: orderBy
                }
            }, tx)

            const totalCount = await NovelProvider
            .Entity
            .totalCount(tx)

            return {
                totalCount,
                list,
            } satisfies INovelList
        })
    }

    public async getNovel(id: NovelUCICode): Promise<INovelEntity> {
        return await NovelProvider
        .Entity
        .findUnique({
            where: {
                id
            }
        })
    }

    public async deleteNovel(id: NovelUCICode): Promise<INovelEntity> {
        return await NovelProvider
        .Entity
        .remove(id)
    }
}

import { PrismaService } from "../common/prisma";

export interface INovelList {
    totalCount: number
    list: INovelEntity[]
}

export interface IRegisterNovelArgs {
    id: NovelUCICode
    requesterEmail: string
    requesterName: string
    novelTitle: string
    novelDescription: string
    ref: string
}