import { tags } from "typia"

import { INovelInfoSnapshotEntity } from "./novel_info_snapshot.entity"

export interface INovelInfoEntity {
    id: string & tags.MaxLength<30>
    snapshots: INovelInfoSnapshotEntity[]
    createdAt: Date
}