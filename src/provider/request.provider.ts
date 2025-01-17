import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";

import { PrismaService } from "../common/prisma";

import { IRequesterEntity } from "./entity/requester.entity";
import { NovelStatusProvider } from "./novel_status.provider";
import { NovelInfoProvider } from "./novel_info.provider";
import { ERROR } from "../common";

export namespace RequesterProvider {
    export const handleException = (e: Error): void => { throw PrismaService.handleException(e) }
    export namespace Entity {
        /// ------
        /// Parsing
        /// ------
        export const toJson = (
            entity: Prisma.requesterGetPayload<ReturnType<typeof select>> | null
        ) => {
            if(!entity) throw ERROR.NotFoundData
            return {
                id: entity.id,
                novelId: entity.novel_id,
                email: entity.email,
                name: entity.name,
                sequence: entity.sequence,
                novelStatus: NovelStatusProvider.Entity.toJson(entity.status),
                novelInfo: NovelInfoProvider.Entity.toJson(entity.info),
                createdAt: new Date(entity.createdAt),
            } satisfies IRequesterEntity
        }
        export const select = () => Prisma.validator<Prisma.requesterFindManyArgs>()({
            include: {
                status: NovelStatusProvider.Entity.select(),
                info: NovelInfoProvider.Entity.select(),
                novel: {
                    select: {
                        id: true
                    }
                }
            }
        })

        /// ------
        /// Query
        /// ------
        export const findUnique = async (
            args: Prisma.requesterFindUniqueArgs,
            tx?: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
        ): Promise<IRequesterEntity> => await (tx ?? PrismaService.client)
        .requester
        .findUnique({
            ...args,
            ...Entity.select(),
        })
        .then(Entity.toJson)
        .catch((e) => { throw handleException(e) })

        export const findFirst = async (
            args: Prisma.requesterFindFirstArgs,
            tx?: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
        ) => await (tx ?? PrismaService.client)
        .requester
        .findFirst(args)
        .then(Entity.toJson)
        .catch((e) => { throw handleException(e) })

        /**
         * 해당 함수로 생성된 requester는 sequence값이 항상 1을 초과합니다.
         */
        export const create = async (
            args: Prisma.requesterCreateArgs,
            tx?: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
        ): Promise<IRequesterEntity> => await (tx ?? PrismaService.client)
        .requester
        .create({
            ...args,
            ...Entity.select(),
        })
        .then(Entity.toJson)
        .catch((e) => { throw handleException(e) })
    }
}