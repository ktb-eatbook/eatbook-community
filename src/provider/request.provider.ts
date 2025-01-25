import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";

import { PrismaService } from "../common/prisma";

import { IRequesterEntity } from "./entity/requester.entity";
import { RequesterHistoryProvider } from "./requester_history.provider";
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
                email: entity.email,
                name: entity.name,
                histories: entity.history.map(history => RequesterHistoryProvider.Entity.toJson(history)),
            } satisfies IRequesterEntity
        }
        export const select = () => Prisma.validator<Prisma.requesterFindManyArgs>()({
            include: {
                history: RequesterHistoryProvider.Entity.select(),
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

        /**
         * 해당 함수로 생성된 requester는 sequence값이 항상 1을 초과합니다.
         */
        export const upsert = async (
            args: Prisma.requesterUpsertArgs,
            tx?: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
        ): Promise<IRequesterEntity> => await (tx ?? PrismaService.client)
        .requester
        .upsert({
            ...args,
            ...Entity.select(),
        })
        .then(Entity.toJson)
        .catch((e) => { throw handleException(e) })
    }
}