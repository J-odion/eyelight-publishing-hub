import { Injectable, Logger } from '@nestjs/common';
import { ResendClient } from './resend.client.js';

@Injectable()
export class ResendContactsService {
  private readonly logger = new Logger(ResendContactsService.name);

  constructor(private readonly resend: ResendClient) {}

  async syncContact(contact: { email: string; firstName?: string; lastName?: string; unsubscribed?: boolean }) {
    try {
      // Create or update the contact in Resend
      const { data, error } = await this.resend.client.contacts.create({
        email: contact.email,
        firstName: contact.firstName,
        lastName: contact.lastName,
        unsubscribed: contact.unsubscribed ?? false,
      });

      if (error) {
        this.logger.error(`Resend contact sync failed for ${contact.email}: ${error.message}`);
        // We don't throw here to avoid failing the CRM transaction just because Resend sync failed
        return null;
      }
      return data;
    } catch (err: any) {
      this.logger.error(`Exception syncing contact ${contact.email} to Resend: ${err.message}`);
      return null;
    }
  }

  async removeContact(email: string) {
    try {
      const { data, error } = await this.resend.client.contacts.remove({ email });
      if (error) {
        this.logger.error(`Resend contact removal failed for ${email}: ${error.message}`);
        return null;
      }
      return data;
    } catch (err: any) {
      this.logger.error(`Exception removing contact ${email} from Resend: ${err.message}`);
      return null;
    }
  }

  async updateContact(email: string, updates: { firstName?: string; lastName?: string; unsubscribed?: boolean }) {
    try {
      const { data, error } = await this.resend.client.contacts.update({
        email,
        ...updates
      });
      if (error) {
        this.logger.error(`Resend contact update failed for ${email}: ${error.message}`);
        return null;
      }
      return data;
    } catch (err: any) {
      this.logger.error(`Exception updating contact ${email} in Resend: ${err.message}`);
      return null;
    }
  }
}
