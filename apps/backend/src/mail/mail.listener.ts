import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WelcomeEmailService } from './transactional/welcome.email.js';
import { AccountNotificationEmailService } from './transactional/account-notification.email.js';

@Injectable()
export class MailListener {
  private readonly logger = new Logger(MailListener.name);

  constructor(
    private readonly welcomeEmailService: WelcomeEmailService,
    private readonly accountNotificationService: AccountNotificationEmailService,
  ) {}

  @OnEvent('user.registered')
  async handleUserRegistered(payload: { email: string; userId: string; name?: string }) {
    this.logger.log(`Handling user.registered event for ${payload.email}`);
    try {
      await this.welcomeEmailService.send(payload.email, payload.name || 'Author');
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${payload.email}`, error);
    }
  }

  @OnEvent('project.status_changed')
  async handleProjectStatusChanged(payload: { email: string; userId: string; data: { status: string } }) {
    this.logger.log(`Handling project.status_changed event for ${payload.email}`);
    try {
      await this.accountNotificationService.send(
        payload.email,
        'Manuscript Status Update',
        `The status of your manuscript has been updated to: ${payload.data.status}. Please log in to your dashboard to view the latest details.`
      );
    } catch (error) {
      this.logger.error(`Failed to send status update email to ${payload.email}`, error);
    }
  }
}
