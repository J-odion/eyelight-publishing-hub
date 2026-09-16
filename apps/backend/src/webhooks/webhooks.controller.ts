import { Controller, Post, Headers, Req, Body, UnauthorizedException, Logger } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Webhook } from 'svix';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SendJob, SendJobDocument } from '../email/schemas/send-job.schema.js';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private configService: ConfigService,
    @InjectModel(SendJob.name) private sendJobModel: Model<SendJobDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  @Post('resend')
  async handleResendWebhook(
    @Headers('svix-id') svixId: string,
    @Headers('svix-timestamp') svixTimestamp: string,
    @Headers('svix-signature') svixSignature: string,
    @Req() req: RawBodyRequest<Request>,
    @Body() payload: any
  ) {
    const webhookSecret = this.configService.get<string>('RESEND_WEBHOOK_SECRET');
    if (!webhookSecret) {
      this.logger.warn('RESEND_WEBHOOK_SECRET is not defined. Skipping verification.');
    } else if (svixId && svixTimestamp && svixSignature) {
      try {
        const wh = new Webhook(webhookSecret);
        const bodyStr = JSON.stringify(payload);
        wh.verify(bodyStr, {
          'svix-id': svixId,
          'svix-timestamp': svixTimestamp,
          'svix-signature': svixSignature,
        });
      } catch (err: any) {
        throw new UnauthorizedException('Invalid webhook signature');
      }
    }

    const eventType = payload.type;
    const data = payload.data; // Resend data
    const resendId = data.email_id; // For delivered/bounced events
    
    if (!resendId) return { received: true };

    let newStatus = null;
    switch (eventType) {
      case 'email.delivered': newStatus = 'delivered'; break;
      case 'email.bounced': newStatus = 'bounced'; break;
      case 'email.opened': newStatus = 'opened'; break;
      case 'email.clicked': newStatus = 'clicked'; break;
      case 'email.complained': newStatus = 'complained'; break;
    }

    if (newStatus) {
      const job = await this.sendJobModel.findOneAndUpdate(
        { resendId },
        { status: newStatus, lastEventAt: new Date() },
        { new: true }
      );
      if (job) {
        this.logger.log(`Updated SendJob for ${resendId} to ${newStatus}`);
        if (job.campaignId) {
          this.eventEmitter.emit('sendjob.status_updated', { campaignId: job.campaignId.toString() });
        }
      }
    }

    return { received: true };
  }
}
