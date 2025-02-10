import { tags } from "typia"

import { INovelSnapshotEntity } from "./novel_snapshot.entity"

export interface INovelEntity {
    id: NovelUCICode
    snapshots: INovelSnapshotEntity[]
    requesters: IRequesterIds[]
    createdAt: Date
    deleteAt: Date | null
}

export interface IRequesterIds {
    historyId: string & tags.MaxLength<30>
    requesterId: string & tags.MaxLength<30>
    sequence: number & tags.Minimum<1>
}

export type NovelUCICode = string & tags.Pattern<"^[A-Za-z0-9]{4}-[0-9]{8,11}$">