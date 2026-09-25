import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contact, ContactDocument } from './schemas/contact.schema.js';

@Injectable()
export class CrmListener {
  private readonly logger = new Logger(CrmListener.name);

  constructor(
    @InjectModel(Contact.name) private contactModel: Model<ContactDocument>,
  ) {}

  @OnEvent('resend.webhook')
  async handleResendWebhook(payload: { eventType: string; data: any }) {
    const { eventType, data } = payload;
    const emailAddress = data.to ? data.to[0] : null;

    if (!emailAddress) return;

    if (eventType === 'email.bounced' || eventType === 'email.complained') {
      try {
        const contact = await this.contactModel.findOneAndUpdate(
          { email: emailAddress.toLowerCase() },
          { status: eventType === 'email.bounced' ? 'bounced' : 'complained' },
          { new: true }
        );
        if (contact) {
          this.logger.log(`Marked contact ${emailAddress} as ${contact.status} due to ${eventType}`);
        }
      } catch (e: any) {
        this.logger.error(`Error updating contact status for ${emailAddress}: ${e.message}`);
      }
    }
  }
}
