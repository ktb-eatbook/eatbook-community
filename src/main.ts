import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

import { AppModule } from './app.module';

import { IPGuard } from './guard/ip.guard';

import { serverConfigs } from './common';

const logger: Logger = new Logger("Bootstrap")

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  /**
   * Prod 배포 시, origin 변경 필요
   */
  const corsOptions : CorsOptions = {
    origin: "*",
    methods: ["GET", "DELETE", "POST", "PATCH", "OPTIONS"],
    credentials: false,
    allowedHeaders: ["Authorization", "Content-Type"]
  }

  app.enableCors(corsOptions)

  app.useGlobalGuards(new IPGuard())

  await app.listen(serverConfigs.serverPort ?? 3000)
  .then(_=> {
    logger.log(`Listening from port: ${serverConfigs.serverPort}`)
  })
  .catch(err => {
    logger.error("Failure listen server")
    logger.error`Reson: ${err}`
  })
}
bootstrap();
