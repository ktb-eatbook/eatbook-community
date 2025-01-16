import { Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "../common/prisma";

import { NovelStatusSnapshotProvider } from "./novel_status_snapshot.provider";

import { NovelStatusEntity } from "./entity/novel_status.entity";

const logger: Logger = new Logger("NovelStatusProvider")

export namespace NovelStatusProvider {
    export const handleException = (e: Error): void => { throw PrismaService.handleException(e) }
    export namespace Entity {
        /// ------
        /// Parsing
        /// ------
        export const toJson = (
            entity: Prisma.novelstatusGetPayload<ReturnType<typeof select>> | null
        ) => {
            if(!entity) return null
            return {
                id: entity.id,
                snapshots: entity.snapshot.map(
                    snapshot => NovelStatusSnapshotProvider.Entity.toJson(snapshot)
                ),
                createdAt: new Date(entity.createdAt),
            } satisfies NovelStatusEntity
        }
        export const select = () => Prisma.validator<Prisma.novelstatusFindManyArgs>()({
            include: {
                snapshot: NovelStatusSnapshotProvider.Entity.select(),
            }
        })
    }
}