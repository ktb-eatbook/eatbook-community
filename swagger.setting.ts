/**
 * 네스티아에서 사용법과 일반 NestJs에서 사용되는 방법이 기재되어 있다.
 */

import { INestApplication } from "@nestjs/common";
import { readFileSync } from "fs";
import { SwaggerModule } from '@nestjs/swagger';

import * as path from "path";

export const SwaggerSetting = (app: INestApplication) => {
    // 네스티아에서는 내가 기입한 내용들을 바탕으로 .json형식으로 뱉어내기 때문에
    // 해당파일의 경로를 불러오는것 이다.
    //
    // 기본적으로 네스티아 빌드를 하게되면 dist 폴더를 만들어 그곳에서 실행 시키는데
    // 해당 설정파일들 또한 그곳에 있는 파일로 사용되는지 경로 시작점이 dist이다.
    const swaggerConfig = readFileSync(path.join(__dirname,"../swagger/swagger.json"), 'utf-8')
    SwaggerModule.setup('docs', app, JSON.parse(swaggerConfig))
}