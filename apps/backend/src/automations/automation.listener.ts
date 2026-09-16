import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AutomationEvent, AutomationDocument, Automation } from './schemas/automation.schema.js';
import { SendJob, SendJobDocument } from '../email/schemas/send-job.schema.js';
import { Contact, ContactDocument } from '../crm/schemas/contact.schema.js';

@Injectable()
export class AutomationListener {
  private readonly logger = new Logger(AutomationListener.name);

  constructor(
    @InjectModel(Automation.name) private automationModel: Model<AutomationDocument>,
    @InjectModel(SendJob.name) private sendJobModel: Model<SendJobDocument>,
    @InjectModel(Contact.name) private contactModel: Model<ContactDocument>,
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

      const contact = await this.contactModel.findOne({ email: payload.email });
      if (!contact || contact.status !== 'subscribed') {
        this.logger.log(`Contact not found or not subscribed for email ${payload.email}. Skipping automation.`);
        return;
      }

      // Enqueue SendJob
      const job = new this.sendJobModel({
        contactId: contact._id,
        automationId: (automation as any)._id,
        status: 'queued',
        nextAttemptAt: new Date(),
      });

      await job.save();
      this.logger.log(`Enqueued automation email for ${payload.email} on event ${eventName}`);
    } catch (error) {
      this.logger.error(`Error processing automation event ${eventName}`, error);
    }
  }
}
