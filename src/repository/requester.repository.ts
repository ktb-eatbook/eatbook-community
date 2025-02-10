import { Injectable } from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";

import { 
    IRequesterEntity, 
    NovelUCICode, 
    RequesterProvider 
} from "../provider";
import { PrismaService } from "../common/prisma";
import { RequesterHistoryProvider } from "../provider/requester_history.provider";

@Injectable()
export class RequesterRepository {
    public async findRequester(
        requesterId: string,
    ): Promise<IRequesterEntity> {
        return await RequesterProvider
        .Entity
        .findUnique({
            where: {
                id: requesterId,
            },
            include: {
                history: {
                    where: {
                        novel: {
                            deletedAt: null
                        }
                    }
                }
            }
        })
    }

    public async registFavoriteNovel(args: IAddRequesterArgs): Promise<IRequesterEntity> {
        return PrismaService.client.$transaction(async (tx) => {
            const maxSequence = (await RequesterHistoryProvider
            .Entity
            .findFirst({
                where: {
                    novelId: args.novelId,
                },
                orderBy: {
                    sequence: "desc"
                },
                select: {
                    sequence: true
                }
            }, tx))?.sequence

            const newSequence = maxSequence ? maxSequence + 1 : 1

            return await this.upsertRequester({
                requesterId: args.requesterId,
                email: args.email,
                name: args.name,
                sequence: newSequence,
                novelId: args.novelId,
                tx,
            })
        })
    }

    /// 요청자의 기록이 없다면 requester를 생성하고 소설과 연결
    /// 요청자의 기록이 있다면 소설과 바로 연결
    private async upsertRequester(args: IUpsertRequesterArgs) {
        return await RequesterProvider
        .Entity
        .upsert({
            include: {
                history: {
                    where: {
                        novel: {
                            deletedAt: null
                        }
                    }
                }
            },
            where: {
                id: args.requesterId,
            },
            create: {
                email: args.email,
                name: args.name,
                history: {
                    create: {
                        sequence: args.sequence,
                        novel: {
                            connect: {
                                id: args.novelId,
                            }
                        }
                    }
                }
            },
            update: {
                history: {
                    create: {
                        sequence: args.sequence,
                        novel: {
                            connect: {
                                id: args.novelId,
                            }
                        }
                    }
                }
            }
        }, args.tx)
    }
}

export interface IAddRequesterArgs {
    requesterId: string
    novelId: NovelUCICode
    email: string
    name: string
}

interface IUpsertRequesterArgs {
    requesterId: string,
    email: string,
    name: string,
    sequence: number,
    novelId: string,
    tx?: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
}