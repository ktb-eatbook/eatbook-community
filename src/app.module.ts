import { Module } from '@nestjs/common';

import { MailModule } from './module/mail.module';
import { NovelModule } from './module/novel.module';
import { RequesterModule } from './module/requester.module';
import { NovelStatusModule } from './module/novel_status.module';

@Module({
  imports: [
    MailModule,
    NovelModule,
    NovelStatusModule,
    RequesterModule,
  ],
})
export class AppModule {}
