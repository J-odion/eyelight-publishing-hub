import { Module } from '@nestjs/common';
import { ResendClient } from './resend.client.js';
import { MailService } from './mail.service.js';
import { MailController } from './mail.controller.js';
import { WelcomeEmailService } from './transactional/welcome.email.js';
import { PasswordResetEmailService } from './transactional/password-reset.email.js';
import { AccountNotificationEmailService } from './transactional/account-notification.email.js';
import { MailListener } from './mail.listener.js';

@Module({
  controllers: [MailController],
  providers: [
    ResendClient,
    MailService,
    WelcomeEmailService,
    PasswordResetEmailService,
    AccountNotificationEmailService,
    MailListener,
  ],
  exports: [
    MailService,
    WelcomeEmailService,
    PasswordResetEmailService,
    AccountNotificationEmailService,
  ],
})
export class MailModule {}
