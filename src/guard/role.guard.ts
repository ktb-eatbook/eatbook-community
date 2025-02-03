import { 
    CanActivate,
    ExecutionContext, 
} from "@nestjs/common";
import { Request } from "express"
import { serverConfigs } from "../common";

import { assert } from "typia"

export class RoleGuard implements CanActivate {
    constructor(
        private readonly allowedRoles: BookKeeperRole[]
    ){}

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>()
        const token: string | undefined = (request.headers['Authorization'] ?? request.headers['authorization']) as string | undefined 

        if(!token) return false
        return await this.sendRequestVerifyToken(token)
    }

    private async sendRequestVerifyToken(token: string): Promise<boolean> {
        try {
            let isLoading = true
            const abortController = new AbortController()
            const signal = abortController.signal
            setTimeout(() => {
                if(isLoading) abortController.abort()
            }, 5000)
    
            const data: BookKeeperRole = (await fetch(`${serverConfigs.bookKeeperUrl}/auth/me`, {
                headers: {
                    "Authorization": token,
                    "Content-Type": "application/json"
                },
                method: "GET",
                signal,
            })
            .then(res => res.json())).data
            isLoading = false

            assert<BookKeeperRole>(data)
            return this.allowedRoles.includes(data)
        } catch(e) {
            return false
        }
    }
}

export type BookKeeperRole = "MEMBER" | "ADMIN" | "PENDING_ADMIN" | "AUTHOR"