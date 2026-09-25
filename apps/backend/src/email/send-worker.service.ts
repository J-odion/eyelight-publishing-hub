import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Interval } from '@nestjs/schedule';
import { OnEvent } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import pLimit from 'p-limit';
import { SendJob, SendJobDocument } from './schemas/send-job.schema.js';
import { EmailCampaign, EmailStatus } from './schemas/email.schema.js';
import { Contact, ContactDocument } from '../crm/schemas/contact.schema.js';
import { Automation, AutomationDocument } from '../automations/schemas/automation.schema.js';

@Injectable()
export class SendWorkerService {
  private readonly logger = new Logger(SendWorkerService.name);
  private resend: Resend;
  private limit = pLimit(5); // Concurrency limit
  private isProcessing = false;

  constructor(
    private configService: ConfigService,
    @InjectModel(SendJob.name) private sendJobModel: Model<SendJobDocument>,
    @InjectModel(EmailCampaign.name) private emailModel: Model<EmailCampaign>,
    @InjectModel(Contact.name) private contactModel: Model<ContactDocument>,
    @InjectModel(Automation.name) private automationModel: Model<AutomationDocument>,
  ) {
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');
    if (resendApiKey) {
      this.resend = new Resend(resendApiKey);
    }
  }

  // Task 4: Interval every 5 seconds
  @Interval(5000)
  async processSendJobs() {
    if (this.isProcessing) return;
    this.isProcessing = true;
    try {
      // Claim up to 20 jobs atomically
      const now = new Date();
      const claimedJobs = [];
      
      for (let i = 0; i < 20; i++) {
        const job = await this.sendJobModel.findOneAndUpdate(
          { status: 'queued', nextAttemptAt: { $lte: now } },
          { $set: { status: 'processing' } },
          { new: true }
        );
        if (!job) break;
        claimedJobs.push(job);
      }

      if (claimedJobs.length > 0) {
        this.logger.log(`Claimed ${claimedJobs.length} jobs for processing.`);
        await Promise.all(claimedJobs.map(job => this.limit(() => this.processJob(job))));
        await this.updateCampaignStatsBatch(claimedJobs);
      }
    } catch (error) {
      this.logger.error('Error in processSendJobs', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processJob(job: SendJobDocument) {
    // Delay slightly to respect rate limit (e.g. 100ms)
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      // Re-check contact status
      const contact = await this.contactModel.findById(job.contactId);
      if (!contact || contact.status !== 'subscribed') {
        job.status = 'failed';
        await job.save();
        return;
      }

      // We support Campaign and Automation triggers
      let finalHtml = '';
      let finalSubject = '';

      if (job.campaignId) {
        const campaign = await this.emailModel.findById(job.campaignId);
        if (!campaign) throw new Error('Campaign not found');
        finalHtml = campaign.content || '';
        finalSubject = campaign.subject || '';
      } else if (job.automationId) {
        const automation = await this.automationModel.findById(job.automationId);
        if (!automation) throw new Error('Automation not found');
        finalHtml = automation.content || '';
        finalSubject = automation.subject || '';
      } else {
        throw new Error('SendJob has no campaignId or automationId');
      }

      // Render merge tags (simple regex replace)
      finalHtml = finalHtml.replace(/\{\{firstName\}\}/g, contact.firstName || '');
      finalHtml = finalHtml.replace(/\{\{lastName\}\}/g, contact.lastName || '');

      finalSubject = finalSubject.replace(/\{\{firstName\}\}/g, contact.firstName || '');
      finalSubject = finalSubject.replace(/\{\{lastName\}\}/g, contact.lastName || '');

      if (!this.resend) {
        this.logger.log(`MOCK Send to ${contact.email}: ${finalSubject}`);
        job.status = 'sent';
        job.resendId = 'mock_id_' + Date.now();
        await job.save();
        return;
      }

      // Send ONE CONTACT AT A TIME
      const { data, error } = await this.resend.emails.send({
        from: 'Eyelight Publishing <services@eyelightpublishers.com>',
        to: contact.email,
        subject: finalSubject,
        html: finalHtml,
      });

      if (error) {
        throw new Error(error.message);
      }

      job.status = 'sent';
      job.resendId = data?.id || null;
      await job.save();

    } catch (e: any) {
      this.logger.error(`Job ${job._id} failed: ${e.message}`);
      job.attempts += 1;
      if (job.attempts < 3) {
        job.status = 'queued';
        // Exponential backoff: e.g. attempts * 60 seconds
        job.nextAttemptAt = new Date(Date.now() + job.attempts * 60000);
      } else {
        job.status = 'failed';
      }
      await job.save();
    }
  }

  // Task 5: periodic sweep for stuck 'processing' jobs
  @Interval(60000) // Every 1 min
  async resetStuckJobs() {
    const fiveMinsAgo = new Date(Date.now() - 5 * 60000);
    const result = await this.sendJobModel.updateMany(
      { status: 'processing', updatedAt: { $lt: fiveMinsAgo } },
      { $set: { status: 'queued', nextAttemptAt: new Date() } }
    );
    if (result.modifiedCount > 0) {
      this.logger.log(`Reset ${result.modifiedCount} stuck processing jobs.`);
    }
  }

  // Task 6: Wire campaign stats
  public async updateCampaignStats(campaignId: string) {
    const stats = await this.sendJobModel.aggregate([
      { $match: { campaignId: new Types.ObjectId(campaignId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const statsMap = { queued: 0, sent: 0, failed: 0, delivered: 0, bounced: 0, opened: 0, clicked: 0, complained: 0 };
    stats.forEach(s => {
      if (s._id === 'queued' || s._id === 'processing') statsMap.queued += s.count;
      else if (s._id === 'sent') statsMap.sent += s.count;
      else if (s._id === 'failed') statsMap.failed += s.count;
      else if (s._id === 'delivered') statsMap.delivered += s.count;
      else if (s._id === 'bounced') statsMap.bounced += s.count;
      else if (s._id === 'opened') statsMap.opened += s.count;
      else if (s._id === 'clicked') statsMap.clicked += s.count;
      else if (s._id === 'complained') statsMap.complained += s.count;
    });

    await this.emailModel.findByIdAndUpdate(campaignId, { stats: statsMap });
  }

  @OnEvent('sendjob.status_updated')
  async handleSendJobStatusUpdated(payload: { campaignId: string }) {
    if (payload.campaignId) {
      await this.updateCampaignStats(payload.campaignId);
    }
  }

  private async updateCampaignStatsBatch(jobs: SendJobDocument[]) {
    // Collect unique campaign IDs from this batch
    const campaignIds = [...new Set(jobs.map(j => j.campaignId?.toString()).filter(Boolean))];
    for (const cid of campaignIds) {
      if (cid) await this.updateCampaignStats(cid);
    }
  }
}
