import { Prisma, PrismaClient } from "@prisma/client";
import { assert } from "typia"

import { PrismaService } from "../common/prisma";

import { 
    NovelStatus, 
    INovelStatusSnapshotEntity 
} from "./entity";


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
        } satisfies INovelStatusSnapshotEntity)
        export const select = () => Prisma.validator<Prisma.novelstatussnapshotFindManyArgs>()({})
    }
}