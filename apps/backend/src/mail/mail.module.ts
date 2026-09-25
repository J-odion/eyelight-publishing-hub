import { Module } from '@nestjs/common';
import { ResendClient } from './resend.client.js';
import { MailService } from './mail.service.js';
import { MailController } from './mail.controller.js';

@Module({
  controllers: [MailController],
  providers: [
    ResendClient,
    MailService,
  ],
  exports: [
    MailService,
  ],
})
export class MailModule {}
