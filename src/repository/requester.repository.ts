import { Injectable } from "@nestjs/common";

import { 
    IRequesterEntity, 
    NovelUCICode, 
    RequesterProvider 
} from "../provider";
import { PrismaService } from "../common/prisma";
import { RequesterHistoryProvider } from "../provider/requester_history.provider";
import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";

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

    public async addRequester(args: IAddRequesterArgs, sequence: number): Promise<IRequesterEntity>
    public async addRequester(args: IAddRequesterArgs): Promise<IRequesterEntity>
    public async addRequester(args: IAddRequesterArgs, sequence?: number): Promise<IRequesterEntity> {
        if(sequence) {
            return await this.upsertRequester(
                args.requesterId,
                args.email,
                args.name,
                sequence,
                args.novelId,
            )
        } else {
            return PrismaService.client.$transaction(async (tx) => {
                const maxSequence = await RequesterHistoryProvider
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
                }, tx)
    
                const newSequence = maxSequence ? maxSequence.sequence + 1 : 1
    
                /// 요청자의 기록이 없다면 requester를 생성하고 소설과 연결
                /// 요청자의 기록이 있다면 소설과 바로 연결
                return await this.upsertRequester(
                    args.requesterId,
                    args.email,
                    args.name,
                    newSequence,
                    args.novelId,
                    tx,
                )
            })
        }
    }

    private async upsertRequester(
        requesterId: string,
        email: string,
        name: string,
        sequence: number,
        novelId: string,
        tx?: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
    ) {
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
                id: requesterId,
            },
            create: {
                email,
                name,
                history: {
                    create: {
                        sequence,
                        novel: {
                            connect: {
                                id: novelId,
                            }
                        }
                    }
                }
            },
            update: {
                history: {
                    create: {
                        sequence,
                        novel: {
                            connect: {
                                id: novelId,
                            }
                        }
                    }
                }
            }
        }, tx)
    }
}

export interface IAddRequesterArgs {
    requesterId: string
    novelId: NovelUCICode
    email: string
    name: string
}