import { Prisma, PrismaClient } from "@prisma/client";

import { PrismaService } from "../common/prisma";

import { NovelEntity, NovelUCICode } from "./entity";
import { RequesterProvider } from "./request.provider";
import { DefaultArgs } from "@prisma/client/runtime/library";

export namespace NovelProvider {
    export const handleException = (e: Error) => { return PrismaService.handleException(e) }
    export namespace Entity {
        /// ------
        /// Parsing
        /// ------
        export const toJson = (
            entity: Prisma.novelGetPayload<ReturnType<typeof select>>
        ) => ({
            id: entity.id,
            requesters: entity.requesters.map(requester => RequesterProvider.Entity.toJson(requester)),
            createdAt: new Date(entity.createdAt),
            deleteAt: entity.deletedAt ? new Date(entity.deletedAt) : null,
        } satisfies NovelEntity)
        export const select = () => Prisma.validator<Prisma.novelFindManyArgs>()({
            include: {
                requesters: RequesterProvider.Entity.select(),
            }
        })

        /// ------
        /// Query
        /// ------
        export const findMany = async (
            args: Prisma.novelFindManyArgs,
            tx?: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
        ): Promise<NovelEntity[]> => await (tx ?? PrismaService.client)
        .novel
        .findMany({
            ...args,
            ...Entity.select()
        })
        .then(entities => entities.map(
            entity => Entity.toJson(entity)
        ))
        .catch((e) => { throw handleException(e) })
        
        export const findUnique = async (
            args: Prisma.novelFindUniqueArgs,
            tx?: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
        ) : Promise<NovelEntity> => await (tx ?? PrismaService.client)
        .novel
        .findUnique({
            ...args,
            ...Entity.select(),
        })
        .then(Entity.toJson)
        .catch((e) => { throw handleException(e) })

        /**
         * 최초 소설 등록 요청시에만 사용하도록 하고, 해당 함수로 생성된 requester의 sequence값은 항상 1입니다.
         */
        export const create = async (
            args: Prisma.novelCreateArgs,
            tx?: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
        ) : Promise<NovelEntity> => await (tx ?? PrismaService.client)
        .novel
        .create({
            ...args,
            ...Entity.select(),
        })
        .then(Entity.toJson)
        .catch((e) => { throw handleException(e) })

        export const remove = async (
            id: NovelUCICode,
            tx?: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
        ) : Promise<NovelEntity> => await (tx ?? PrismaService.client)
        .novel
        .update({
            where: {
                id
            },
            data: {
                deletedAt: new Date(Date.now())
            },
            ...Entity.select(),
        })
        .then(Entity.toJson)
        .catch((e) => { throw handleException(e) })

        export const totalCount = async (
            tx?: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
        ): Promise<number> => await (tx ?? PrismaService.client)
        .novel
        .count({
            where: {
                deletedAt: {
                    not: null
                }
            }
        })
        .catch((e) => { throw handleException(e) })
    }
}