import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";

import { PrismaService } from "../common/prisma";

import { ERROR } from "../common";
import { INovelEntity, NovelUCICode } from "./entity";
import { NovelSnapshotProvider } from "./novel_snaphost.provider";

export namespace NovelProvider {
    export const handleException = (e: Error) => { return PrismaService.handleException(e) }
    export namespace Entity {
        /// ------
        /// Parsing
        /// ------
        export const toJson = (
            entity: Prisma.novelGetPayload<ReturnType<typeof select>> | null
        ) => {
            if(!entity) throw ERROR.NotFoundData
            return {
                id: entity.id,
                snapshots: entity.snapshots.map(snapshot => NovelSnapshotProvider.Entity.toJson(snapshot)),
                requesters: entity.requesters.map(({ id, requesterId, sequence }) => ({ historyId: id, requesterId, sequence })),
                createdAt: new Date(entity.createdAt),
                deleteAt: entity.deletedAt ? new Date(entity.deletedAt) : null,
            } satisfies INovelEntity
        }
        export const select = () => Prisma.validator<Prisma.novelFindManyArgs>()({
            include: {
                snapshots: NovelSnapshotProvider.Entity.select(),
                requesters: {
                    select: {
                        id: true,
                        requesterId: true,
                        sequence: true,
                    }
                }
            }
        })

        /// ------
        /// Query
        /// ------
        export const findMany = async (
            args: Prisma.novelFindManyArgs,
            tx?: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
        ): Promise<INovelEntity[]> => await (tx ?? PrismaService.client)
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
        ) : Promise<INovelEntity> => await (tx ?? PrismaService.client)
        .novel
        .findUnique({
            ...args,
            ...Entity.select(),
        })
        .then(Entity.toJson)
        .catch((e) => { throw handleException(e) })

        export const update = async (
            args: Prisma.novelUpdateArgs,
            tx?: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
        ) : Promise<INovelEntity> => await (tx ?? PrismaService.client)
        .novel
        .update({
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
        ) : Promise<INovelEntity> => await (tx ?? PrismaService.client)
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
        ) : Promise<INovelEntity> => await (tx ?? PrismaService.client)
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
                deletedAt: null
            }
        })
        .catch((e) => { throw handleException(e) })
    }
}