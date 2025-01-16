import { Module } from '@nestjs/common';

import { MailModule } from './module/mail.module';
import { NovelModule } from './module/novel.module';
import { RequesterModule } from './module/requester.module';

@Module({
  imports: [
    MailModule,
    NovelModule,
    RequesterModule,
  ],
})
export class AppModule {}
