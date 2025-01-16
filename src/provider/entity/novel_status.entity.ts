import { tags } from "typia"
import { NovelStatusSnapshotEntity } from "./novel_status_snapshot.entity"

export interface NovelStatusEntity {
    id: string & tags.MaxLength<30>
    snapshots: NovelStatusSnapshotEntity[]
    createdAt: Date
}