import { Module } from "@nestjs/common";

import { RequesterController } from "../controller/requester.controller";
import { RequesterService } from "../service/requester.service";
import { RequesterRepository } from "../repository/requester.repository";

@Module({
    providers: [
        RequesterService,
        RequesterRepository,
    ],
    controllers: [RequesterController],
    exports: [],
})
export class RequesterModule {}