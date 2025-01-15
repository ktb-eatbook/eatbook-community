import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';

import { AppModule } from './app.module';
import { serverConfigs } from './common';

const logger: Logger = new Logger("Bootstrap")

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await app.listen(serverConfigs.serverPort ?? 3000)
  .then(_=> {
    logger.log(`Listen from port: ${serverConfigs.serverPort}`)
  })
  .catch(err => {
    logger.error("Failure listen server")
    logger.error`Reson: ${err}`
  })
}
bootstrap();
