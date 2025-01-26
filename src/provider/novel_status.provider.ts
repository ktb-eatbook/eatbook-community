import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";

import { PrismaService } from "../common/prisma";

import { NovelStatusSnapshotProvider } from "./novel_status_snapshot.provider";

import { INovelStatusEntity } from "./entity/novel_status.entity";

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
            } satisfies INovelStatusEntity
        }
        export const select = () => Prisma.validator<Prisma.novelstatusFindManyArgs>()({
            include: {
                snapshot: NovelStatusSnapshotProvider.Entity.select(),
            }
        })

        /// ------
        /// Query
        /// ------
        export const findUnique = async (
            args: Prisma.novelstatusFindUniqueArgs,
            tx?: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
        ): Promise<INovelStatusEntity | null> => await (tx ?? PrismaService.client)
        .novelstatus
        .findUnique({
            ...args,
            ...Entity.select(),
        })
        .then(Entity.toJson)
        .catch((e) => { throw handleException(e) })
        
        export const update = async (
            args: Prisma.novelstatusUpdateArgs,
            tx?: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
        ): Promise<INovelStatusEntity | null> => await (tx ?? PrismaService.client)
        .novelstatus
        .update({
            ...args,
            ...Entity.select(),
        })
        .then(Entity.toJson)
        .catch((e) => { throw handleException(e) })
    }
}