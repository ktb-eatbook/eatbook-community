import { 
    CanActivate, 
    ExecutionContext, 
    HttpException, 
    HttpStatus, 
    Injectable, 
    Logger
} from "@nestjs/common";
import { Request } from "express"
import * as geoip from 'geoip-lite';

import { ERROR } from "../common";

const logger: Logger = new Logger("IPGUARD")

@Injectable()
export class IPGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();
        
        // 공유기 접근 시, 실제 아이피 식별을 위한 헤더 추출
        const forwardedFor = request.headers['x-forwarded-for']
        const routerIp = (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(',')[0])
        
        const clientIp = routerIp ? routerIp : (request.ip || request.socket.remoteAddress)?.split("::ffff:")[1]
        
        if(clientIp === undefined) {
            logger.warn(`아이피가 존재하지 않은 요청`)
            const message = ERROR.Forbidden.message
            throw new HttpException(message, HttpStatus.FORBIDDEN)
        }
        
        const method = request.method
        // 앱, 웹의 요청은 GET, POST 만 허용
        switch(method) {
            case "DELETE":
            case "PATCH":
            case "PUT":
                logger.warn(`허용되지 않은 메소드 요청\n아이피: ${clientIp}\n메소드: ${method}`)
                const message = ERROR.Forbidden.message
                throw new HttpException(message, HttpStatus.FORBIDDEN)
        }

        // 로컬 접근 허용
        if(localIps.includes(clientIp)) {
            return true
        }

        // 한국에서 온 요청만 허용
        const geo = geoip.lookup(clientIp)
        if(geo?.country === "KR") {
            return true
        } else {
            logger.warn(`허용되지 않은 국가에서의 요청\n아이피:${clientIp}\nGeolocation: ${geo}`)
            const message = ERROR.Forbidden.message
            throw new HttpException(message, HttpStatus.FORBIDDEN)
        }
    }
}

const localIps = ["localhost","127.0.0.1"]