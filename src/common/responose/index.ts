export type SuccessResponse<T> = {
    readonly data: T
    readonly message: string
    readonly statusCode: number
    metadata?: string
}

export type FailedResponse = {
    readonly message: string
    readonly statusCode: number
    metadata?: string
}

export const ERROR : Record<string, FailedResponse> = {
    /** 성공 */
    "Accepted": { statusCode: 202, message: "요청이 성공적으로 전달되었으나 처리가 되지 않을 수 있습니다." },
    "NonAuthoritativeInformation": { statusCode: 203, message: "입력한 정보가 맞는지 한번 더 확인해주세요." },
    "NotFoundData": { statusCode: 204, message: "요청한 자료를 찾을 수 없습니다." },
    /** 사용자 에러 */
    "BadRequest": { statusCode: 400, message: "잘못된 요청 방식 입니다." },
    "UnAuthorized": { statusCode: 401, message: "해당 요청에 필요한 자격 증명에 실패 했습니다." },
    "Forbidden": { statusCode: 403, message: "서버에 의해 요청이 차단 되었습니다." },
    "NotFound": { statusCode: 404, message: "요청 페이지를 찾을 수 없습니다." },
    "MethodNotAllowd": { statusCode: 405, message: "허용되지 않은 메소드 입니다." },
    "RequestTimeOut": { statusCode: 408, message: "요청시간이 만료 되었습니다." },
    "Conflict": { statusCode: 409, message: "이미 존재하는 데이터 입니다." },
    "TooManyRequests": { statusCode: 429, message: "과도한 요청으로 인해 일정 시간동안 차단됩니다." },
    /** 서버 에러 */
    // refused 응답을 받았을 경우에 발생하는 듯, 이 경우 요청서버가 제대로 동작중이지 않을 확률이 높음.
    "BadGateway": { statusCode: 502, message: "네트워크 장치를 확인 한 이후에 다시 시도해주세요." },
    // 서버가 요청을 처리할 수 없는 상태임
    // 부하가 심하던 사용하는 DB 혹은 Redis가 죽었던 등등
    "ServiceUnavailableException": { statusCode: 5000, message: "현재 해당 요청을 처리할 수 없습니다.\n나중에 다시 시도해주세요."},
    "ServerDatabaseError": { statusCode: 5001, message: "데이터 베이스 작업 중, 오류가 발생했습니다.\n로그를 확인해주세요." },
    "UnKnownException": { statusCode: 5002, message: "알 수 없는 오류가 발생했습니다.\n 로그를 확인해주세요." }
}

export type KeyOfValue = keyof typeof ERROR
export type ValueOfERROR = (typeof ERROR)[KeyOfValue]
export type TryCatch<T, E extends FailedResponse> = SuccessResponse<T> | E