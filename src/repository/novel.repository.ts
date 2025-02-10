import { Injectable } from "@nestjs/common";

import { 
    INovelEntity,
    IRequesterEntity,
    NovelProvider,
    NovelUCICode 
} from "../provider";
import { PrismaService } from "../common/prisma";
import { RequesterRepository } from "./requester.repository";

@Injectable()
export class NovelRepository {
    constructor(
        private readonly requesterRepository: RequesterRepository,
    ){}
    public async registerNovel(args: IRegisterNovelArgs): Promise<INovelEntity | IRequesterEntity> {
        return await PrismaService.client.$transaction(async tx => {
            const isAlreadyNovel = await NovelProvider.Entity
            .findUnique({
                where: {
                    id: args.id,
                }
            }, tx)
            .catch(_=> null)
            
            if(isAlreadyNovel !== null && isAlreadyNovel !== undefined) {
                /// 이미 등록 된 소설일 경우, 히스토리를 기록합니다.
                return await this.requesterRepository.registFavoriteNovel({
                    email: args.requesterEmail,
                    name: args.requesterName,
                    novelId: args.id,
                    requesterId: args.requesterId,
                })
            } else {
                /// 최초 생성 시, 소설과 요청자를 잇는 history가 생성됩니다.
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
                                requester: {
                                    connectOrCreate: {
                                        create: {
                                            id: args.requesterId,
                                            email: args.requesterEmail,
                                            name: args.requesterName,
                                        },
                                        where: {
                                            id: args.requesterId,
                                        }
                                    }
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
                }, tx)
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
                take: 10,
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
                totalCount: Math.max(1, Math.ceil(totalCount / 10)),
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

export interface INovelEntityList {
    totalCount: number
    list: INovelEntity[]
}

export interface IRegisterNovelArgs {
    id: NovelUCICode
    requesterId: string
    requesterEmail: string
    requesterName: string
    novelTitle: string
    novelDescription: string
    ref: string
}