import { tags } from "typia"

import { INovelStatusEntity } from "./novel_status.entity"

export interface INovelStatusSnapshotEntity {
    id: string & tags.MaxLength<30>
    reason: string & tags.MaxLength<300>
    status: NovelStatus
    responsiblePersonEmail: string & tags.Format<"email">
    responsiblePerson: string
    createdAt: Date
}

export type NovelStatus = "pending" | "reviewed" | "confirm" | "cancel"

export const getLatestNovelStatus = (novelStatus: INovelStatusEntity): INovelStatusSnapshotEntity => {
    return novelStatus.snapshots.sort((a, b) => {
        if(a.createdAt > b.createdAt) return -1
        else if(a.createdAt < b.createdAt) return 1
        return 0
    })[0]
}