import { Controller, Post, Body } from '@nestjs/common';
import { MailService } from './mail.service.js';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('test')
  async testEmail(@Body('to') to: string) {
    if (!to) {
      return { error: 'Please provide a "to" email address in the body' };
    }
    
    return this.mailService.send({
      to,
      subject: 'Resend integration test',
      html: `
        <h1>It works!</h1>
        <p>Your NestJS application is successfully connected to Resend.</p>
      `,
    });
  }
}
