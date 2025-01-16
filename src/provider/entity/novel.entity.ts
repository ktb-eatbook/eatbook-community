import { tags } from "typia"
import { RequesterEntity } from "./requester.entity"

export interface NovelEntity {
    id: NovelUCICode
    requesters: RequesterEntity[]
    createdAt: Date
    deleteAt: Date | null
}

export type NovelUCICode = string & tags.Pattern<"[A-Za-z0-9]{4}-[0-9]{8,11}">