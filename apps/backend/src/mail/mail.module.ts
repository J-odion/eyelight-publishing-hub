import { Module } from '@nestjs/common';
import { ResendClient } from './resend.client.js';
import { MailService } from './mail.service.js';
import { MailController } from './mail.controller.js';
import { WelcomeEmailService } from './transactional/welcome.email.js';
import { PasswordResetEmailService } from './transactional/password-reset.email.js';
import { AccountNotificationEmailService } from './transactional/account-notification.email.js';
import { MailListener } from './mail.listener.js';
import { ResendContactsService } from './resend.contacts.service.js';

@Module({
  controllers: [MailController],
  providers: [
    ResendClient,
    MailService,
    WelcomeEmailService,
    PasswordResetEmailService,
    AccountNotificationEmailService,
    MailListener,
    ResendContactsService,
  ],
  exports: [
    MailService,
    WelcomeEmailService,
    PasswordResetEmailService,
    AccountNotificationEmailService,
    ResendContactsService,
  ],
})
export class MailModule {}
