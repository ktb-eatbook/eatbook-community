import { Module } from '@nestjs/common';
import { MailModule } from './module/mail.module';

@Module({
  imports: [
    MailModule,
  ],
})
export class AppModule {}
