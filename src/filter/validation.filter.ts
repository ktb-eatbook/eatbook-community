import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    BadRequestException,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

import { ERROR } from '../common';

/// typia 타입 Exception을 포함한 모든 input 에러를 catch하기 위한 필터 
@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
    catch(_: BadRequestException, host: ArgumentsHost) {
        const ctx = host.switchToHttp()
        const response = ctx.getResponse<Response>()
        response.status(HttpStatus.BAD_REQUEST).json(ERROR.BadRequest)
    }
}