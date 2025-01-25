import { tags } from "typia"

import { INovelSnapshotEntity } from "./novel_snapshot.entity"
import { NovelUCICode } from "./novel.entity"

export interface IRequesterHistoryEntity {
    id: string & tags.MaxLength<30>
    novelId: NovelUCICode,
    novelSnapshots: INovelSnapshotEntity[]
    requesterId: string & tags.MaxLength<38>
    sequence: number & tags.Minimum<1>
    createdAt: Date
}