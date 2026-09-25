import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import juice from 'juice';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron } from '@nestjs/schedule';
import { ResendClient } from '../mail/resend.client.js';
import { EmailCampaign, EmailStatus } from './schemas/email.schema.js';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly fromAddress: string;

  constructor(
    private configService: ConfigService,
    private readonly resendClient: ResendClient,
    @InjectModel(EmailCampaign.name) private emailModel: Model<EmailCampaign>,
  ) {
    this.fromAddress = this.configService.get<string>('RESEND_FROM_EMAIL') || 'Eyelight Publishing <services@eyelightpublishers.com>';
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

  async removeCampaign(id: string) {
    const campaign = await this.emailModel.findById(id);
    if (!campaign) throw new NotFoundException('Campaign not found');
    
    // If it was already pushed to Resend, we can optionally remove the broadcast there too
    if (campaign.resendBroadcastId) {
      try {
        await this.resendClient.client.broadcasts.remove(campaign.resendBroadcastId);
      } catch (e: any) {
        this.logger.warn(`Failed to remove broadcast from Resend: ${e.message}`);
      }
    }
    
    await this.emailModel.findByIdAndDelete(id);
    return campaign;
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
        await this.sendNow(campaign._id.toString());
      }
    }
  }

  async sendNow(id: string) {
    const campaign = await this.emailModel.findById(id);
    if (!campaign) throw new NotFoundException('Campaign not found');
    if (campaign.status === EmailStatus.SENT || campaign.status === EmailStatus.SENDING) {
      return { success: false, message: 'Campaign already sent or sending' };
    }

    try {
      campaign.status = EmailStatus.SENDING;
      await campaign.save();

      const audienceId = this.configService.get<string>('RESEND_AUDIENCE_ID');
      if (!audienceId) {
        throw new Error('RESEND_AUDIENCE_ID is not configured. Cannot create broadcast.');
      }

      // 1. Create the broadcast in Resend
      const { data: broadcast, error: createError } = await this.resendClient.client.broadcasts.create({
        audienceId: audienceId, // Note: To segment, you would map CRM segments to Resend Segment APIs
        from: this.fromAddress,
        subject: campaign.subject,
        html: campaign.content,
      });

      if (createError || !broadcast) {
        campaign.status = EmailStatus.DRAFT;
        await campaign.save();
        throw new Error(createError?.message || 'Failed to create broadcast');
      }

      campaign.resendBroadcastId = broadcast.id;
      
      // 2. Send the broadcast
      const { error: sendError } = await this.resendClient.client.broadcasts.send(broadcast.id);
      
      if (sendError) {
        campaign.status = EmailStatus.DRAFT;
        await campaign.save();
        throw new Error(sendError.message);
      }

      campaign.status = EmailStatus.SENT;
      campaign.sentAt = new Date();
      await campaign.save();
      
      this.logger.log(`Successfully sent broadcast ${broadcast.id} for campaign ${campaign._id}`);
      return { success: true, broadcastId: broadcast.id };

    } catch (e: any) {
      this.logger.error(`Error sending broadcast: ${e.message}`);
      return { success: false, message: e.message };
    }
  }

  async getCampaignStats(id: string) {
    const campaign = await this.emailModel.findById(id);
    if (!campaign) throw new NotFoundException('Campaign not found');

    if (!campaign.resendBroadcastId) {
      return {
        stats: campaign.stats || { queued: 0, sent: 0, failed: 0 },
        message: 'No Resend Broadcast ID found (maybe a legacy campaign)'
      };
    }

    try {
      // Fetch live analytics from Resend
      const { data, error } = await this.resendClient.client.broadcasts.get(campaign.resendBroadcastId);
      if (error || !data) {
        throw new Error(error?.message || 'Failed to fetch stats from Resend');
      }

      // We can also fetch clicked links specifically
      // const { data: clicks } = await this.resendClient.client.broadcasts.clickedLinks(campaign.resendBroadcastId);

      return {
        success: true,
        stats: {
          sent: data.status === 'sent' ? 1 : 0, // Resend doesn't expose raw counts directly in get() unless it's available? Broadcast API just gives status. Let's return raw data.
          status: data.status,
          resendData: data
        }
      };
    } catch (e: any) {
      this.logger.error(`Failed to fetch stats for broadcast ${campaign.resendBroadcastId}: ${e.message}`);
      return { success: false, message: e.message };
    }
  }

  // Used for "compose & send now" direct sends from the UI (Transactional loop)
  async sendDirect(to: string[], subject: string, html: string) {
    const inlinedHtml = juice(html);
    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (const email of to) {
      try {
        const { error } = await this.resendClient.client.emails.send({
          from: this.fromAddress,
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

  async sendTestPreview(adminEmail: string, subject: string, rawHtml: string) {
    let html = juice(rawHtml);
    html = html.replace(/\{\{firstName\}\}/g, 'Admin');
    html = html.replace(/\{\{lastName\}\}/g, 'User');
    html = html.replace(/\{\{unsubscribeUrl\}\}/g, 'https://eyelightpublishers.com/unsubscribe?mock=1');

    let finalSubject = subject;
    finalSubject = finalSubject.replace(/\{\{firstName\}\}/g, 'Admin');
    finalSubject = finalSubject.replace(/\{\{lastName\}\}/g, 'User');

    await this.resendClient.client.emails.send({
      from: this.fromAddress,
      to: adminEmail,
      subject: `[TEST] ${finalSubject}`,
      html,
    });
    return { success: true };
  }
}
