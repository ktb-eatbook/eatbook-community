import { Logger } from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/client";

import { PrismaService } from "../common/prisma";

import { INovelInfoSnapshotEntity } from "./entity/novel_info_snapshot.entity";
import { DefaultArgs } from "@prisma/client/runtime/library";

const logger: Logger = new Logger("NovelInfoSnapshotProvider")

export namespace NovelInfoSnapshotProvider {
    export const handleException = (e: Error): void => { throw PrismaService.handleException(e) }
    export namespace Entity {
        /// ------
        /// Parsing
        /// ------
        export const toJson = (
            entity: Prisma.novelinfosnapshotGetPayload<ReturnType<typeof select>>
        ) => ({
            id: entity.id,
            title: entity.title,
            description: entity.description,
            ref: entity.ref,
            createdAt: new Date(entity.createdAt),
        } satisfies INovelInfoSnapshotEntity)
        export const select = () => Prisma.validator<Prisma.novelinfosnapshotFindManyArgs>()({})

        /// ------
        /// Query
        /// ------
        export const create = async (
            args: Prisma.novelinfosnapshotCreateArgs,
            tx?: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
        ): Promise<INovelInfoSnapshotEntity> => await (tx ?? PrismaService.client)
        .novelinfosnapshot
        .create({
            ...args,
            ...Entity.select(),
        })
        .then(Entity.toJson)
        .catch((e) => { throw handleException(e) })
    }
}