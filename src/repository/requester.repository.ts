import { Injectable } from "@nestjs/common";

import { 
    IRequesterEntity, 
    RequesterProvider 
} from "../provider";

import { tags } from "typia"

@Injectable()
export class RequesterRepository {
    public async findRequester(email: string & tags.Format<"email">): Promise<IRequesterEntity> {
        return await RequesterProvider
        .Entity
        .findUnique({
            where: {
                email,
            }
        })
    }
}