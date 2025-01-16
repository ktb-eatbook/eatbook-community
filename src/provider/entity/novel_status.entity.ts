import { tags } from "typia"
import { INovelStatusSnapshotEntity } from "./novel_status_snapshot.entity"

export interface INovelStatusEntity {
    id: string & tags.MaxLength<30>
    snapshots: INovelStatusSnapshotEntity[]
    createdAt: Date
}