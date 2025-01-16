import { Prisma, PrismaClient } from "@prisma/client";
import { assert } from "typia"

import { PrismaService } from "../common/prisma";

import { 
    NovelStatus, 
    NovelStatusSnapshotEntity 
} from "./entity";
import { DefaultArgs } from "@prisma/client/runtime/library";


export namespace NovelStatusSnapshotProvider {
    export const handleException = (e: Error): void => { throw PrismaService.handleException(e) }
    export namespace Entity {
        /// ------
        /// Parsing
        /// ------
        export const toJson = (
            entity: Prisma.novelstatussnapshotGetPayload<ReturnType<typeof select>>
        ) => ({
            id: entity.id,
            reason: entity.reason,
            status: assert<NovelStatus>(entity.status),
            responsiblePerson: entity.responsiblePerson,
            responsiblePersonEmail: entity.responsiblePersonEmail,
            createdAt: new Date(entity.createdAt),
        } satisfies NovelStatusSnapshotEntity)
        export const select = () => Prisma.validator<Prisma.novelstatussnapshotFindManyArgs>()({})

        /// ------
        /// Query
        /// ------
        export const create = async (
            args: Prisma.novelstatussnapshotCreateArgs,
            tx?: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
        ): Promise<NovelStatusSnapshotEntity> => await (tx ?? PrismaService.client)
        .novelstatussnapshot
        .create({
            ...args,
            ...Entity.select(),
        })
        .then(Entity.toJson)
        .catch((e) => { throw handleException(e) })
    }
}