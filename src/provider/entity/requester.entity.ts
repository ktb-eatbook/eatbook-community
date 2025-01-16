import { tags } from "typia"

import { NovelInfoEntity } from "./novel_info.entity"
import { NovelStatusEntity } from "./novel_status.entity"
import { NovelUCICode } from "./novel.entity"

/// sequence 값이 1인 요청자는 최초 소설 등록 요청한 사용자 입니다.
/// sequence 값이 1초과인 요청자는 novelInfo, novelStatus 프로퍼티가 항상 null입니다.
export interface RequesterEntity {
    id: string & tags.MaxLength<30>
    novelId: NovelUCICode
    email: string & tags.Format<"email">
    name: string
    novelInfo: NovelInfoEntity | null
    novelStatus: NovelStatusEntity | null
    sequence: number
    createdAt: Date
}