import { Controller, Post, Headers, Req, Body, UnauthorizedException, Logger } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Webhook } from 'svix';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private configService: ConfigService,
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
    const resendId = data.email_id; 
    
    if (!resendId) return { received: true };

    this.logger.log(`Received Resend Webhook: ${eventType} for message ${resendId}`);
    
    // Emit event so the CRM or EmailCampaign schemas can be updated if desired
    this.eventEmitter.emit('resend.webhook', { eventType, data });

    return { received: true };
  }
}
