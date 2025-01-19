import { Prisma } from "@prisma/client"

import { PrismaService } from "../common/prisma"
import { NovelInfoProvider } from "./novel_info.provider"
import { NovelStatusProvider } from "./novel_status.provider"
import { INovelSnapshotEntity } from "./entity/novel_snapshot.entity"

export namespace NovelSnapshotProvider {
    export const handleException = (e: Error): void => { throw PrismaService.handleException(e) }
    export namespace Entity {
        export const toJson = (
            entity: Prisma.novelsnapshotGetPayload<ReturnType<typeof select>>
        ) => ({
            id: entity.id,
            novelInfo: NovelInfoProvider.Entity.toJson(entity.info),
            novelStatus: NovelStatusProvider.Entity.toJson(entity.status),
            createdAt: entity.createdAt,
        } satisfies INovelSnapshotEntity)
        export const select = () => Prisma.validator<Prisma.novelsnapshotFindManyArgs>()({
            include: {
                info: NovelInfoProvider.Entity.select(),
                status: NovelStatusProvider.Entity.select(),
            }
        })
    }
}