import { tags } from "typia"

export interface INovelStatusSnapshotEntity {
    id: string & tags.MaxLength<30>
    reason: string & tags.MaxLength<300>
    status: NovelStatus
    responsiblePersonEmail: string & tags.Format<"email">
    responsiblePerson: string
    createdAt: Date
}

export type NovelStatus = "pending" | "reviewed" | "confirm" | "cancel"