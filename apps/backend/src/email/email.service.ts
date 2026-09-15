import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Resend } from 'resend';
import { EmailCampaign, EmailStatus } from './schemas/email.schema.js';
import { User } from '../users/schemas/user.schema.js';

@Injectable()
export class EmailService {
  private resend: Resend;
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private configService: ConfigService,
    @InjectModel(EmailCampaign.name) private emailModel: Model<EmailCampaign>,
    @InjectModel(User.name) private userModel: Model<User>,
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

  // Cron job runs every hour to check for scheduled emails
  @Cron(CronExpression.EVERY_HOUR)
  async handleScheduledEmails() {
    this.logger.log('Checking for scheduled emails...');
    const now = new Date();
    
    const scheduledCampaigns = await this.emailModel.find({
      status: EmailStatus.SCHEDULED,
      scheduledFor: { $lte: now }
    });

    for (const campaign of scheduledCampaigns) {
      // Find users matching audience tags
      // For simplicity, we just fetch all users for now if audience is empty,
      // or filter based on role/tags.
      let query = {};
      if (campaign.audienceTags && campaign.audienceTags.length > 0) {
        if (campaign.audienceTags.includes('Author')) {
          query = { role: 'author' };
        }
      }
      
      const users = await this.userModel.find(query);
      const emails = users.map(u => u.email);

      if (emails.length > 0) {
        // Chunk emails to avoid hitting limits (Resend limit is typically 50 per batch)
        const BATCH_SIZE = 50;
        for (let i = 0; i < emails.length; i += BATCH_SIZE) {
          const batch = emails.slice(i, i + BATCH_SIZE);
          await this.sendEmail(batch, campaign.subject, campaign.content);
        }
      }

      campaign.status = EmailStatus.SENT;
      campaign.sentAt = new Date();
      await campaign.save();
      
      this.logger.log(`Sent campaign "${campaign.subject}" to ${emails.length} recipients.`);
    }
  }

  // Immediately send a campaign regardless of its schedule
  async sendNow(id: string) {
    const campaign = await this.emailModel.findById(id);
    if (!campaign) throw new Error('Campaign not found');

    let query = {};
    if (campaign.audienceTags && campaign.audienceTags.length > 0) {
      if (campaign.audienceTags.includes('Author')) {
        query = { role: 'author' };
      }
    }
    
    const users = await this.userModel.find(query);
    const emails = users.map(u => u.email);

    if (emails.length > 0) {
      const BATCH_SIZE = 50;
      for (let i = 0; i < emails.length; i += BATCH_SIZE) {
        const batch = emails.slice(i, i + BATCH_SIZE);
        await this.sendEmail(batch, campaign.subject, campaign.content);
      }
    }

    campaign.status = EmailStatus.SENT;
    campaign.sentAt = new Date();
    await campaign.save();
    
    this.logger.log(`Manually sent campaign "${campaign.subject}" to ${emails.length} recipients.`);
    return { success: true, recipients: emails.length };
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
