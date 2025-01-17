import { Injectable } from "@nestjs/common";

import { 
    IRequesterEntity, 
    NovelUCICode, 
    RequesterProvider 
} from "../provider";
import { PrismaService } from "../common/prisma";

@Injectable()
export class RequesterRepository {
    public async findRequester(id: string): Promise<IRequesterEntity> {
        return await RequesterProvider
        .Entity
        .findUnique({
            where: {
                id,
            }
        })
    }

    public async addRequester(args: IAddRequesterArgs): Promise<IRequesterEntity> {
        return PrismaService.client.$transaction(async (tx) => {
            const maxSequence = await RequesterProvider
            .Entity
            .findFirst({
                where: {
                    novel_id: args.novelId
                },
                orderBy: {
                    sequence: "desc"
                },
                select: {
                    sequence: true
                }
            }, tx)
            const newSequence = maxSequence ? maxSequence.sequence + 1 : 1

            return await RequesterProvider
            .Entity
            .create({
                data: {
                    novel: {
                        connect: {
                            id: args.novelId
                        }
                    },
                    email: args.email,
                    name: args.name,
                    sequence: newSequence,
                }
            }, tx)
        })
    }
}

export interface IAddRequesterArgs {
    novelId: NovelUCICode
    email: string
    name: string
}