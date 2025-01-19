import { Prisma, PrismaClient } from "@prisma/client"
import { DefaultArgs } from "@prisma/client/runtime/library"

import { PrismaService } from "../common/prisma"
import { IRequesterHistoryEntity } from "./entity/requester_history.entity"
import { NovelProvider } from "./novel.provider"
import { NovelSnapshotProvider } from "./novel_snaphost.provider"

export namespace RequesterHistoryProvider {
    export const handleException = (e: Error): void => { throw PrismaService.handleException(e) }
    export namespace Entity {
        export const toJson = (
            entity: Prisma.requesterhistoryGetPayload<ReturnType<typeof select>>
        ) => ({
            id: entity.id,
            novelId: entity.novelId,
            novelSnapshots: entity.novel.snapshots.map(snapshot => NovelSnapshotProvider.Entity.toJson(snapshot)),
            requesterId: entity.requesterId,
            sequence: entity.sequence,
            createdAt: new Date(entity.createdAt),
        } satisfies IRequesterHistoryEntity)
        export const select = () => Prisma.validator<Prisma.requesterhistoryFindManyArgs>()({
            include: {
                novel: NovelProvider.Entity.select(),
            }
        })

        export const findFirst = async (
            args: Prisma.requesterhistoryFindFirstArgs,
            tx?: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
        ) => await (tx ?? PrismaService.client)
        .requesterhistory
        .findFirst(args)
        .catch((e) => { throw handleException(e) })
    }
}