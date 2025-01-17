import { tags } from "typia"

import { INovelInfoEntity } from "./novel_info.entity"
import { INovelStatusEntity } from "./novel_status.entity"
import { NovelUCICode } from "./novel.entity"

/// sequence 값이 1인 요청자는 최초 소설 등록 요청한 사용자 입니다.
/// sequence 값이 1초과인 요청자는 novelInfo, novelStatus 프로퍼티가 항상 null입니다.
export interface IRequesterEntity {
    id: string & tags.MaxLength<30>
    novelId: NovelUCICode
    email: string & tags.Format<"email">
    name: string
    novelInfo: INovelInfoEntity | null
    novelStatus: INovelStatusEntity | null
    sequence: number
    createdAt: Date
}

export interface IInitialRequester {
    id: string & tags.MaxLength<30>
    novelId: NovelUCICode
    email: string & tags.Format<"email">
    name: string
    novelInfo: INovelInfoEntity
    novelStatus: INovelStatusEntity
    sequence: number
    createdAt: Date
}

export const getInitialRequester = (requesters: IRequesterEntity[]): IInitialRequester | undefined => {
    return requesters.find(requester => requester.sequence === 1) as IInitialRequester
}