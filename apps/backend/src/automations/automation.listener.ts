import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import juice from 'juice';
import { AutomationEvent, AutomationDocument, Automation } from './schemas/automation.schema.js';
import { Contact, ContactDocument } from '../crm/schemas/contact.schema.js';
import { MailService } from '../mail/mail.service.js';

@Injectable()
export class AutomationListener {
  private readonly logger = new Logger(AutomationListener.name);

  constructor(
    @InjectModel(Automation.name) private automationModel: Model<AutomationDocument>,
    @InjectModel(Contact.name) private contactModel: Model<ContactDocument>,
    private readonly mailService: MailService,
  ) {}

  @OnEvent('**')
  async handleAutomationEvents(eventName: string, payload: { email?: string; userId?: string; data?: any }) {
    // Check if the event matches any of our AutomationEvent enums
    if (!Object.values(AutomationEvent).includes(eventName as AutomationEvent)) return;

    try {
      // Find active automation for this event
      const automation = await this.automationModel.findOne({ triggerEvent: eventName as AutomationEvent, isActive: true });
      if (!automation) return;

      // Find contact by email
      if (!payload.email) {
        this.logger.warn(`Event ${eventName} fired without email payload. Cannot process automation.`);
        return;
      }

      let contact = await this.contactModel.findOne({ email: payload.email });

      // For newsletter.subscribed, auto-create the contact if they don't exist in CRM yet
      if (!contact && eventName === AutomationEvent.NEWSLETTER_SUBSCRIBED) {
        contact = await this.contactModel.create({
          email: payload.email,
          firstName: payload.data?.name?.split(' ')[0] || '',
          lastName: payload.data?.name?.split(' ').slice(1).join(' ') || '',
          tags: ['newsletter'],
          source: 'signup',
          status: 'subscribed',
        });
        this.logger.log(`Auto-created CRM contact for newsletter subscriber: ${payload.email}`);
      }

      if (!contact || contact.status !== 'subscribed') {
        this.logger.log(`Contact not found or not subscribed for email ${payload.email}. Skipping automation.`);
        return;
      }

      // Instead of queueing a SendJob locally, send immediately via MailService
      let html = juice(automation.content);
      html = html.replace(/\{\{firstName\}\}/g, contact.firstName || '');
      html = html.replace(/\{\{lastName\}\}/g, contact.lastName || '');

      let subject = automation.subject;
      subject = subject.replace(/\{\{firstName\}\}/g, contact.firstName || '');

      await this.mailService.send({
        to: contact.email,
        subject,
        html,
      });

      this.logger.log(`Sent automation email for ${payload.email} on event ${eventName}`);
    } catch (error) {
      this.logger.error(`Error processing automation event ${eventName}`, error);
    }
  }
}
