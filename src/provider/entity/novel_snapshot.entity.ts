import { tags } from "typia"
import { INovelInfoEntity } from "./novel_info.entity"
import { INovelStatusEntity } from "./novel_status.entity"

export interface INovelSnapshotEntity {
    id: string & tags.MaxLength<30>
    novelInfo: INovelInfoEntity | null
    novelStatus: INovelStatusEntity | null
    createdAt: Date
}

export const getLatestNovelSnapshot = (snapshots: INovelSnapshotEntity[]) => {
    return snapshots.sort((a, b) => {
        if(a.createdAt > b.createdAt) return -1
        else if(a.createdAt < b.createdAt) return 1
        return 0
    })[0]
}