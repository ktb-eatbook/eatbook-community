import { Injectable } from "@nestjs/common";

import { 
    INovelEntity,
    NovelProvider,
    NovelUCICode 
} from "../provider";

@Injectable()
export class NovelRepository {
    /// 최초 생성 시, 소설과 요청자를 잇는 history가 생성됨
    public async registerNovel(args: IRegisterNovelArgs): Promise<INovelEntity> {
        return await NovelProvider
        .Entity
        .create({
            data: {
                id: args.id,
                requesters: {
                    create: {
                        sequence: 1,
                        /// requester는 표기상 요청자 일 뿐 실제 데이터는 requesterhistory
                        /// 요청자가 이미 존재할 경우 connect처리
                        /// 요청자가 없을 경우 create 처리
                        requester: args.requesterId
                        ? {
                            connect: {
                                id: args.requesterId
                            }
                        }
                        : {
                            create: {
                                email: args.requesterEmail,
                                name: args.requesterName,
                            },
                        }
                    },
                },
                snapshots: {
                    create: {
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
                                        reason: "미확인",
                                    },
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
    ): Promise<INovelEntityList> {
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
                totalCount: Math.max(1, Math.floor(totalCount / 10)),
                list,
            } satisfies INovelEntityList
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

export interface INovelEntityList {
    totalCount: number
    list: INovelEntity[]
}

export interface IRegisterNovelArgs {
    id: NovelUCICode
    requesterId: string | null
    requesterEmail: string
    requesterName: string
    novelTitle: string
    novelDescription: string
    ref: string
}