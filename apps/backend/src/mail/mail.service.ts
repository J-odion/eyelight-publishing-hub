import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ResendClient } from './resend.client.js';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly resend: ResendClient,
    private readonly configService: ConfigService,
  ) {}

  async send({
    to,
    subject,
    html,
    replyTo,
  }: {
    to: string | string[];
    subject: string;
    html: string;
    replyTo?: string;
  }) {
    // Defaulting to the known valid email for now to avoid crashes if RESEND_FROM_EMAIL is missing in this env
    const from = this.configService.get<string>('RESEND_FROM_EMAIL') || 'Grace From EyelightPublishers <services@eyelightpublishers.com>';
    
    const { data, error } = await this.resend.client.emails.send({
      from,
      to,
      subject,
      html,
      replyTo,
    });

    if (error) {
      this.logger.error(error);
      throw new Error(error.message);
    }
    
    this.logger.log(`Email sent: ${data?.id}`);
    return data;
  }
}
