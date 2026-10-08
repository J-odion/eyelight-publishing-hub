import { Injectable, Logger, forwardRef, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CrmService } from './crm.service.js';

@Injectable()
export class CrmListener {
  private readonly logger = new Logger(CrmListener.name);

  constructor(
    @Inject(forwardRef(() => CrmService)) private crmService: CrmService,
  ) {}

  @OnEvent('user.registered')
  async handleUserRegistered(payload: { email: string; userId: string; name?: string }) {
    this.logger.log(`Auto-adding newly registered user ${payload.email} to CRM`);
    try {
      await this.crmService.createContact({
        email: payload.email,
        firstName: payload.name?.split(' ')[0] || 'Author',
        lastName: payload.name?.split(' ').slice(1).join(' ') || '',
        tags: ['author'],
        source: 'signup',
      });
    } catch (e: any) {
      this.logger.error(`Failed to add new user ${payload.email} to CRM`, e.message);
    }
  }

  @OnEvent('newsletter.subscribed')
  async handleNewsletterSubscribed(payload: { email: string; data: any }) {
    try {
      const contact = await this.crmService.createContact({
        email: payload.email,
        firstName: payload.data?.name?.split(' ')[0] || '',
        lastName: payload.data?.name?.split(' ').slice(1).join(' ') || '',
        tags: ['newsletter'],
        source: 'newsletter',
      });
      await this.crmService.updateLeadScore(contact._id.toString(), 5);
      this.logger.log(`Added 5 points to ${payload.email} for newsletter signup`);
    } catch (e: any) {
      this.logger.error(`Failed to handle newsletter for ${payload.email}`, e.message);
    }
  }

  @OnEvent('consultation.booked')
  async handleConsultationBooked(payload: { email: string; data: any }) {
    try {
      const contact = await this.crmService.createContact({
        email: payload.email,
        firstName: payload.data?.name?.split(' ')[0] || '',
        lastName: payload.data?.name?.split(' ').slice(1).join(' ') || '',
        tags: ['consultation'],
        source: 'consultation',
      });
      await this.crmService.updateLeadScore(contact._id.toString(), 15);
      this.logger.log(`Added 15 points to ${payload.email} for consultation booking`);
    } catch (e: any) {
      this.logger.error(`Failed to handle consultation for ${payload.email}`, e.message);
    }
  }

  @OnEvent('resend.webhook')
  async handleResendWebhook(payload: { eventType: string; data: any }) {
    const { eventType, data } = payload;
    const emailAddress = data.to ? data.to[0] : null;

    if (!emailAddress) return;

    if (eventType === 'email.bounced' || eventType === 'email.complained') {
      try {
        const contact = await this.crmService.getContactByEmail(emailAddress);
        if (contact) {
          await this.crmService.updateContact(contact._id.toString(), { 
            status: eventType === 'email.bounced' ? 'bounced' : 'complained' 
          });
          this.logger.log(`Marked contact ${emailAddress} as ${eventType === 'email.bounced' ? 'bounced' : 'complained'}`);
        }
      } catch (e: any) {
        this.logger.error(`Error updating contact status for ${emailAddress}: ${e.message}`);
      }
    }
  }
}
