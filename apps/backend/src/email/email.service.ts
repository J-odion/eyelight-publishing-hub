import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Resend } from 'resend';
import { EmailCampaign, EmailStatus } from './schemas/email.schema.js';
import { User } from '../users/schemas/user.schema.js';
import { Contact, ContactDocument } from '../crm/schemas/contact.schema.js';
import { SendJob, SendJobDocument } from './schemas/send-job.schema.js';

@Injectable()
export class EmailService {
  private resend: Resend;
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private configService: ConfigService,
    @InjectModel(EmailCampaign.name) private emailModel: Model<EmailCampaign>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Contact.name) private contactModel: Model<ContactDocument>,
    @InjectModel(SendJob.name) private sendJobModel: Model<SendJobDocument>,
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
        from: 'Eyelight Publishing <hello@eyelight.com>', // Update this with verified domain later
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

  async createCampaign(data: any) {
    const campaign = new this.emailModel({
      ...data,
      status: data.scheduledFor ? EmailStatus.SCHEDULED : EmailStatus.DRAFT
    });
    return campaign.save();
  }

  async getAllCampaigns() {
    return this.emailModel.find().sort({ createdAt: -1 }).exec();
  }

  private async enqueueCampaign(campaign: EmailCampaign) {
    // Task 3: resolve its audience
    const query: any = { status: 'subscribed' };
    if (campaign.audienceTags && campaign.audienceTags.length > 0) {
      query.tags = { $in: campaign.audienceTags };
    } else {
      // If no tags, we should arguably not send to anyone to prevent accidents,
      // but spec says "never fall back to querying all users".
      // Let's ensure if no tags are selected, we find 0 contacts.
      this.logger.warn(`Campaign ${campaign._id} has no audience tags, skipping...`);
      campaign.status = EmailStatus.SENT;
      await campaign.save();
      return { success: true, queued: 0 };
    }
    
    const contacts = await this.contactModel.find(query);
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
    // Only log if something is found to avoid spam
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
    // If updating scheduledFor, reset status accordingly
    if (data.scheduledFor) {
      data.status = EmailStatus.SCHEDULED;
    } else if (data.status !== EmailStatus.SENT) {
      data.status = EmailStatus.DRAFT;
    }
    const campaign = await this.emailModel.findByIdAndUpdate(id, data, { new: true });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  async removeCampaign(id: string) {
    const campaign = await this.emailModel.findByIdAndDelete(id);
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }
}
