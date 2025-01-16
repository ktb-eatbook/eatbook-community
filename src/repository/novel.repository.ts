import { Injectable } from "@nestjs/common";

import { 
    NovelEntity,
    NovelProvider, 
    NovelUCICode 
} from "../provider";

@Injectable()
export class NovelRepository {
    public async registerNovel(args: RegisterNovelArgs): Promise<NovelEntity> {
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

    public async getNovelList(page: number & tags.Minimum<1>): Promise<NovelList> {
        return await PrismaService
        .client
        .$transaction(async tx => {
            const list = await NovelProvider
            .Entity
            .findMany({
                skip: (page - 1) * 10,
                take: page * 10,
                where: {
                    deletedAt: {
                        not: null
                    }
                },
                orderBy: {
                    createdAt: "desc"
                }
            }, tx)

            const totalCount = await NovelProvider
            .Entity
            .totalCount(tx)

            return {
                totalCount,
                list,
            } satisfies NovelList
        })
    }

    public async getNovel(id: NovelUCICode): Promise<NovelEntity> {
        return await NovelProvider
        .Entity
        .findUnique({
            where: {
                id
            }
        })
    }

    public async deleteNovel(id: NovelUCICode): Promise<NovelEntity> {
        return await NovelProvider
        .Entity
        .remove(id)
    }
}

import { tags } from "typia"
import { PrismaService } from "../common/prisma";

export interface NovelList {
    totalCount: number
    list: NovelEntity[]
}

export interface RegisterNovelArgs {
    id: NovelUCICode
    requesterEmail: string & tags.Format<"email">
    requesterName: string
    novelTitle: string & tags.MaxLength<200>
    novelDescription: string & tags.MaxLength<200>
    ref: string & tags.Format<"url">
}