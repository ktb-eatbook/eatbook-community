import { tags } from "typia"

import { NovelInfoSnapshotEntity } from "./novel_info_snapshot.entity"

export interface NovelInfoEntity {
    id: string & tags.MaxLength<30>
    snapshots: NovelInfoSnapshotEntity[]
    createdAt: Date
}