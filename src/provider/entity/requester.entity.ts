import { tags } from "typia"

import { IRequesterHistoryEntity } from "./requester_history.entity"

/// sequence 값이 1인 요청자는 최초 소설 등록 요청한 사용자 입니다.
/// sequence 값이 1초과인 요청자는 novelInfo, novelStatus 프로퍼티가 항상 null입니다.
export interface IRequesterEntity {
    id: string & tags.MaxLength<38>
    email: string & tags.Format<"email">
    name: string
    histories: IRequesterHistoryEntity[]
}