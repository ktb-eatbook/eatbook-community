import { Injectable } from "@nestjs/common";

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

    public async addRequester(args: IAddRequesterArgs): Promise<IRequesterEntity> {
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
 
            async function createRequester() {
                return await RequesterProvider
                .Entity
                .create({
                    include: {
                        history: {
                            where: {
                                novel: {
                                    deletedAt: null
                                }
                            }
                        }
                    },
                    data: {
                        email: args.email,
                        name: args.name,
                        history: {
                            create: {
                                sequence: newSequence,
                                novel: {
                                    connect: {
                                        id: args.novelId,
                                    }
                                }
                            }
                        }
                    },
                }, tx)
            }

            async function updateRequester(requesterId: string) {
                return await RequesterProvider
                .Entity
                .update({
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
                    data: {
                        history: {
                            create: {
                                sequence: newSequence,
                                novel: {
                                    connect: {
                                        id: args.novelId,
                                    }
                                }
                            }
                        }
                    }
                }, tx)
            }

            /// 요청자의 기록이 없다면 requester를 생성하고 소설과 연결
            /// 요청자의 기록이 있다면 소설과 바로 연결
            return await (args.requesterId ? updateRequester(args.requesterId!) : createRequester())
        })
    }
}

export interface IAddRequesterArgs {
    requesterId: string | null
    novelId: NovelUCICode
    email: string
    name: string
}