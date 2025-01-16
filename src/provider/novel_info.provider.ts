import { Prisma } from "@prisma/client";

import { PrismaService } from "../common/prisma";

import { NovelInfoSnapshotProvider } from "./novel_info_snapshot.provider";

import { INovelInfoEntity } from "./entity/novel_info.entity";

export namespace NovelInfoProvider {
    export const handleException = (e: Error): void => { throw PrismaService.handleException(e) }
    export namespace Entity {
        /// ------
        /// Parsing
        /// ------
        export const toJson = (
            entity: Prisma.novelinfoGetPayload<ReturnType<typeof select>> | null
        ) => {
            if(!entity) return null
            return {
                id: entity.id,
                snapshots: entity.snapshot.map(
                    snapshot => NovelInfoSnapshotProvider.Entity.toJson(snapshot)
                ),
                createdAt: new Date(entity.createdAt),
            } satisfies INovelInfoEntity
        }
        export const select = () => Prisma.validator<Prisma.novelinfoFindManyArgs>()({
            include: {
                snapshot: NovelInfoSnapshotProvider.Entity.select(),
            }
        })
    }
}