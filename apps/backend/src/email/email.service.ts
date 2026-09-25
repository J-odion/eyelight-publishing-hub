import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import juice from 'juice';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cron } from '@nestjs/schedule';
import { Resend } from 'resend';
import { EmailCampaign, EmailStatus } from './schemas/email.schema.js';
import { Contact, ContactDocument } from '../crm/schemas/contact.schema.js';
import { SendJob, SendJobDocument } from './schemas/send-job.schema.js';
import { List, ListDocument } from '../crm/schemas/list.schema.js';

const FROM_ADDRESS = 'Eyelight Publishing <services@eyelightpublishers.com>';

@Injectable()
export class EmailService {
  private resend: Resend;
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private configService: ConfigService,
    @InjectModel(EmailCampaign.name) private emailModel: Model<EmailCampaign>,
    @InjectModel(Contact.name) private contactModel: Model<ContactDocument>,
    @InjectModel(SendJob.name) private sendJobModel: Model<SendJobDocument>,
    @InjectModel(List.name) private listModel: Model<ListDocument>,
  ) {
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');
    if (resendApiKey) {
      this.resend = new Resend(resendApiKey);
    } else {
      this.logger.warn('RESEND_API_KEY is missing. Emails will not be sent.');
    }
  }

  async sendEmail(to: string | string[], subject: string, html: string) {
    if (!this.resend) {
      this.logger.log(`Mock Sending Email to ${to} - Subject: ${subject}`);
      return;
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: FROM_ADDRESS,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      });

      if (error) {
        this.logger.error('Failed to send email via Resend', error);
      }
      return data;
    } catch (e) {
      this.logger.error('Exception while sending email', e);
    }
  }

  /**
   * Send directly to a list of email addresses without going through the job queue.
   * Used for "compose & send now" to individuals.
   */
  async sendDirect(to: string[], subject: string, html: string) {
    if (!this.resend) {
      this.logger.log(`Mock Direct Send to ${to.join(', ')} - Subject: ${subject}`);
      return { success: true, mock: true, count: to.length };
    }

    const inlinedHtml = juice(html);
    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (const email of to) {
      try {
        const { error } = await this.resend.emails.send({
          from: FROM_ADDRESS,
          to: [email],
          subject,
          html: inlinedHtml,
        });
        if (error) {
          failCount++;
          errors.push(`${email}: ${error.message}`);
        } else {
          successCount++;
        }
      } catch (e: any) {
        failCount++;
        errors.push(`${email}: ${e.message}`);
      }
    }

    return { success: true, sent: successCount, failed: failCount, errors };
  }

  async createCampaign(data: any) {
    if (data.content) {
      data.content = juice(data.content);
    }
    const campaign = new this.emailModel({
      ...data,
      status: data.scheduledFor ? EmailStatus.SCHEDULED : EmailStatus.DRAFT
    });
    return campaign.save();
  }

  async getAllCampaigns() {
    return this.emailModel.find().sort({ createdAt: -1 }).exec();
  }

  private async resolveAudience(campaign: EmailCampaign): Promise<ContactDocument[]> {
    const contactIdSet = new Set<string>();
    const allContacts: ContactDocument[] = [];

    // 1. Resolve by tags
    if (campaign.audienceTags && campaign.audienceTags.length > 0) {
      const tagContacts = await this.contactModel.find({
        status: 'subscribed',
        tags: { $in: campaign.audienceTags }
      });
      for (const c of tagContacts) {
        if (!contactIdSet.has(c._id.toString())) {
          contactIdSet.add(c._id.toString());
          allContacts.push(c);
        }
      }
    }

    // 2. Resolve by list IDs
    if (campaign.audienceListIds && campaign.audienceListIds.length > 0) {
      // For static lists: find contacts that have these listIds
      const listContacts = await this.contactModel.find({
        status: 'subscribed',
        listIds: { $in: campaign.audienceListIds }
      });
      for (const c of listContacts) {
        if (!contactIdSet.has(c._id.toString())) {
          contactIdSet.add(c._id.toString());
          allContacts.push(c);
        }
      }

      // For dynamic lists: execute their query
      const dynamicLists = await this.listModel.find({
        _id: { $in: campaign.audienceListIds },
        type: 'dynamic',
        query: { $ne: null }
      });
      for (const list of dynamicLists) {
        const dynContacts = await this.contactModel.find({
          status: 'subscribed',
          ...(list.query || {})
        });
        for (const c of dynContacts) {
          if (!contactIdSet.has(c._id.toString())) {
            contactIdSet.add(c._id.toString());
            allContacts.push(c);
          }
        }
      }
    }

    // 3. Resolve by individual contact IDs
    if (campaign.audienceContactIds && campaign.audienceContactIds.length > 0) {
      const individuals = await this.contactModel.find({
        _id: { $in: campaign.audienceContactIds },
        status: 'subscribed'
      });
      for (const c of individuals) {
        if (!contactIdSet.has(c._id.toString())) {
          contactIdSet.add(c._id.toString());
          allContacts.push(c);
        }
      }
    }

    return allContacts;
  }

  private async enqueueCampaign(campaign: any) {
    const contacts = await this.resolveAudience(campaign);

    if (contacts.length === 0) {
      this.logger.warn(`Campaign ${campaign._id} found 0 contacts to send to.`);
      campaign.status = EmailStatus.SENT;
      await campaign.save();
      return { success: true, queued: 0 };
    }

    // Insert one SendJob per resolved contact
    const jobs = contacts.map(c => ({
      contactId: c._id,
      campaignId: campaign._id,
      status: 'queued',
      nextAttemptAt: new Date()
    }));

    await this.sendJobModel.insertMany(jobs);

    campaign.status = EmailStatus.SENDING;
    campaign.stats = { queued: jobs.length, sent: 0, failed: 0 };
    await campaign.save();
    
    this.logger.log(`Enqueued campaign "${campaign.subject}" to ${jobs.length} contacts.`);
    return { success: true, queued: jobs.length };
  }

  // Cron job runs frequently to check for scheduled emails
  @Cron('*/30 * * * * *') // Every 30 seconds
  async handleScheduledEmails() {
    const now = new Date();
    
    const scheduledCampaigns = await this.emailModel.find({
      status: EmailStatus.SCHEDULED,
      scheduledFor: { $lte: now }
    });

    if (scheduledCampaigns.length > 0) {
      this.logger.log(`Found ${scheduledCampaigns.length} scheduled campaigns ready to send...`);
      for (const campaign of scheduledCampaigns) {
        await this.enqueueCampaign(campaign);
      }
    }
  }

  async updateCampaign(id: string, data: any) {
    if (data.content) {
      data.content = juice(data.content);
    }
    if (data.scheduledFor) {
      data.status = EmailStatus.SCHEDULED;
    } else if (data.status !== EmailStatus.SENT) {
      data.status = EmailStatus.DRAFT;
    }
    const campaign = await this.emailModel.findByIdAndUpdate(id, data, { new: true });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  async sendNow(id: string) {
    const campaign = await this.emailModel.findById(id);
    if (!campaign) throw new NotFoundException('Campaign not found');
    if (campaign.status === EmailStatus.SENT || campaign.status === EmailStatus.SENDING) {
      return { success: false, message: 'Campaign already sent or sending' };
    }
    return this.enqueueCampaign(campaign);
  }

  async removeCampaign(id: string) {
    const campaign = await this.emailModel.findByIdAndDelete(id);
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  async sendTestPreview(adminEmail: string, subject: string, rawHtml: string) {
    let contact = await this.contactModel.findOne({ email: adminEmail });
    if (!contact) {
      contact = new this.contactModel({
        email: adminEmail,
        firstName: 'Admin',
        lastName: 'User',
      });
    }

    let html = juice(rawHtml);
    html = html.replace(/\{\{firstName\}\}/g, contact.firstName || 'Admin');
    html = html.replace(/\{\{lastName\}\}/g, contact.lastName || 'User');
    html = html.replace(/\{\{unsubscribeUrl\}\}/g, 'https://eyelightpublishers.com/unsubscribe?mock=1');

    let finalSubject = subject;
    finalSubject = finalSubject.replace(/\{\{firstName\}\}/g, contact.firstName || 'Admin');
    finalSubject = finalSubject.replace(/\{\{lastName\}\}/g, contact.lastName || 'User');

    await this.sendEmail(adminEmail, `[TEST] ${finalSubject}`, html);
    return { success: true };
  }
}
