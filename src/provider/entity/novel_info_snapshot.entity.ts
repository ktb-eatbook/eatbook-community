import { tags } from "typia"

export interface NovelInfoSnapshotEntity {
    id: string & tags.MaxLength<30>
    title: string & tags.MaxLength<200>
    description: string & tags.MaxLength<200>
    ref: string & tags.Format<"url">
    createdAt: Date
}