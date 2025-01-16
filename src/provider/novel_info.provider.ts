import { Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "../common/prisma";

import { NovelInfoSnapshotProvider } from "./novel_info_snapshot.provider";

import { NovelInfoEntity } from "./entity/novel_info.entity";

const logger: Logger = new Logger("NovelInfoProvider")

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
            } satisfies NovelInfoEntity
        }
        export const select = () => Prisma.validator<Prisma.novelinfoFindManyArgs>()({
            include: {
                snapshot: NovelInfoSnapshotProvider.Entity.select(),
            }
        })
    }
}