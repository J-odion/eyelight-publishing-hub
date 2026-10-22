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

      // Find or create contact
      let contact = await this.contactModel.findOne({ email: payload.email });
      const fullName = payload.data?.customerName || payload.data?.name || '';
      const firstName = fullName ? fullName.split(' ')[0] : (contact?.firstName || 'there');
      const lastName = fullName ? fullName.split(' ').slice(1).join(' ') : (contact?.lastName || '');

      if (!contact) {
        try {
          contact = await this.contactModel.create({
            email: payload.email,
            firstName: firstName !== 'there' ? firstName : '',
            lastName,
            tags: [eventName.split('.')[0]],
            source: eventName,
            status: 'subscribed',
          });
          this.logger.log(`Auto-created CRM contact for ${payload.email} (${eventName})`);
        } catch (e: any) {
          this.logger.warn(`Could not auto-create contact: ${e?.message}`);
        }
      }

      // Check unsubscribed only for newsletter events, never for transactional confirmations
      if (contact && contact.status === 'unsubscribed' && eventName === AutomationEvent.NEWSLETTER_SUBSCRIBED) {
        this.logger.log(`Contact ${payload.email} is unsubscribed. Skipping newsletter.`);
        return;
      }

      const recipientName = firstName !== 'there' ? firstName : (contact?.firstName || 'there');
      const recipientFullName = fullName || (contact ? `${contact.firstName} ${contact.lastName}`.trim() : recipientName);

      // Context variables
      const slotDate = payload.data?.slotDate || payload.data?.metadata?.slotDate || 'Scheduled Date';
      const slotTime = payload.data?.slotTime || payload.data?.metadata?.slotTime || 'Scheduled Time';
      const amountFormatted = payload.data?.amount ? `₦${Number(payload.data.amount).toLocaleString()}` : '';
      const purpose = payload.data?.purpose || 'Eyelight Publishing';
      const reference = payload.data?.reference || '';
      const checkoutUrl = payload.data?.checkoutUrl || (
        purpose.toLowerCase().includes('consultation') 
          ? 'https://eyelightpublishers.com/book' 
          : 'https://eyelightpublishers.com/editor-school#register-form'
      );

      let html = juice(automation.content);
      html = html.replace(/\{\{name\}\}/g, recipientFullName);
      html = html.replace(/\{\{firstName\}\}/g, recipientName);
      html = html.replace(/\{\{lastName\}\}/g, lastName);
      html = html.replace(/\{\{slotDate\}\}/g, slotDate);
      html = html.replace(/\{\{slotTime\}\}/g, slotTime);
      html = html.replace(/\{\{amount\}\}/g, amountFormatted);
      html = html.replace(/\{\{purpose\}\}/g, purpose);
      html = html.replace(/\{\{reference\}\}/g, reference);
      html = html.replace(/\{\{checkoutUrl\}\}/g, checkoutUrl);

      let subject = automation.subject;
      subject = subject.replace(/\{\{name\}\}/g, recipientName);
      subject = subject.replace(/\{\{firstName\}\}/g, recipientName);
      subject = subject.replace(/\{\{purpose\}\}/g, purpose);

      await this.mailService.send({
        to: payload.email,
        subject,
        html,
      });

      this.logger.log(`Sent automation email [${subject}] to ${payload.email} for ${eventName}`);
    } catch (error) {
      this.logger.error(`Error processing automation event ${eventName}`, error);
    }
  }
}
