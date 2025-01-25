import { Logger } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { 
    PrismaClientInitializationError, 
    PrismaClientKnownRequestError,
    PrismaClientRustPanicError,
    PrismaClientUnknownRequestError,
    PrismaClientValidationError, 
} from "@prisma/client/runtime/library";
import { ERROR, FailedResponse } from "../responose";

const logger: Logger = new Logger("Prisma")

export class PrismaService {
    public static readonly client: PrismaClient = new PrismaClient()

    /**
     * DB 데이터 중복 작성 및 없는 데이터 조회등 개별 처리 추가 해야 함
     * 
     * 실제 오류는 서버 로그에 기록하고, 사용자에게는 BadRequest를 반환합니다.  
     * 사용자는 서버 내부의 이슈를 알 이유가 없기 때문입니다.
     * @returns FailedResponse
     */
    public static handleException(e: Error): FailedResponse {
        if("statusCode" in e) {
            throw e
        } else if(e instanceof PrismaClientKnownRequestError) {
            this.printKnownRequestError(e)
        } else if(e instanceof PrismaClientUnknownRequestError) {
            this.printUnKnownRequestError(e)
        } else if(e instanceof PrismaClientInitializationError) {
            this.printInitializationError(e)
        } else if(e instanceof PrismaClientValidationError) {
            this.printValidationError(e)
        } else if(e instanceof PrismaClientRustPanicError) {
            this.printRustPanicError(e)
        } else {
            this.printDefaultError(e)
        }
        throw ERROR.BadRequest
    }

    private static printKnownRequestError(e: PrismaClientKnownRequestError) {
        logger.error(PrismaClientKnownRequestError.name)
        logger.error(ERROR.ServerDatabaseError.message)
        logger.error(`Status: ${e.code}`)
        logger.error(`Reason: ${e.message}`)
        if(e.meta) { logger.error(`Meta: ${Object.values(e.meta)}`) }
        const statusCode = parseInt(e.code.split("P")[1])
        let error = ERROR.BadRequest
        switch(statusCode) {
            case 2001:
                error = ERROR.NotFoundData
                break
            case 2015:
                error = ERROR.NotFoundData
                error.metadata = "존재하지 않는 테이블을 참조했습니다."
                break
            case 2011:
                error = ERROR.Conflict
                break
            case 2025:
                error.metadata = "존재하지 않는 테이블을 참조했습니다."
                break
        }

        throw error
    }

    private static printUnKnownRequestError(e: PrismaClientUnknownRequestError) {
        logger.error(PrismaClientUnknownRequestError.name)
        logger.error(ERROR.ServerDatabaseError.message)
        logger.error(`Reason: ${e.message}`)
    }

    private static printInitializationError(e: PrismaClientInitializationError) {
        logger.error(PrismaClientInitializationError.name)
        logger.error(ERROR.ServerDatabaseError.message)
        logger.error(`Reason: ${e.message}`)
        if(e.errorCode) { logger.error(`ErrorCode: ${e.errorCode}`) }
    }

    private static printValidationError(e: PrismaClientValidationError) {
        logger.error(PrismaClientValidationError.name)
        logger.error(ERROR.ServerDatabaseError.message)
        logger.error(`Reason: ${e.message}`)
    }

    private static printRustPanicError(e: PrismaClientRustPanicError) {
        logger.error(PrismaClientRustPanicError.name)
        logger.error(ERROR.ServerDatabaseError.message)
        logger.error(`Reason: ${e.message}`)
    }

    private static printDefaultError(e: Error) {
        logger.error(e.name)
        logger.error(ERROR.UnKnownException.message)
        logger.error(e.message)
    }
}