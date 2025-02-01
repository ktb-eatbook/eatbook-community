import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

import { AppModule } from './app.module';

import { IPGuard } from './guard/ip.guard';

import { serverConfigs } from './common';
import { ValidationExceptionFilter } from './filter/validation.filter';
import { SwaggerSetting } from 'swagger.setting';

const logger: Logger = new Logger("Bootstrap")

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  
  /// ---
  /// Cors
  /// ---
  /**
   * Prod 배포 시, origin 변경 필요
   */
  const corsOptions : CorsOptions = {
    origin: "*",
    methods: ["GET", "DELETE", "POST", "PATCH", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type"],
  }
  app.enableCors(corsOptions)

  /// ---
  /// Middleware
  /// ---
  app.useGlobalGuards(new IPGuard())
  app.useGlobalFilters(new ValidationExceptionFilter())

  /// ---
  /// Swagger
  /// ---
  SwaggerSetting(app)

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
