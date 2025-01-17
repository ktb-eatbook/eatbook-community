import { tags } from "typia"

import { INovelInfoEntity } from "./novel_info.entity"

export interface INovelInfoSnapshotEntity {
    id: string & tags.MaxLength<30>
    title: string & tags.MaxLength<200>
    description: string & tags.MaxLength<200>
    ref: string & tags.Format<"url">
    createdAt: Date
}

export const getLatestNovelInfo = (novelInfo: INovelInfoEntity): INovelInfoSnapshotEntity => {
    return novelInfo.snapshots.sort((a, b) => {
        if(a.createdAt > b.createdAt) return -1
        else if(a.createdAt < b.createdAt) return 1
        return 0
    })[0]
}