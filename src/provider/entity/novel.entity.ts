import { tags } from "typia"
import { IRequesterEntity } from "./requester.entity"

export interface INovelEntity {
    id: NovelUCICode
    requesters: IRequesterEntity[]
    createdAt: Date
    deleteAt: Date | null
}

export type NovelUCICode = string & tags.Pattern<"[A-Za-z0-9]{4}-[0-9]{8,11}">