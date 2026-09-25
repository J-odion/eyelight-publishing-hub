import { Injectable } from '@nestjs/common';
import { MailService } from '../mail.service.js';

@Injectable()
export class AccountNotificationEmailService {
  constructor(private readonly mailService: MailService) {}

  async send(to: string, title: string, message: string) {
    const html = `
      <div style="font-family: sans-serif; max-w-md; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
        <h2 style="color: #333;">${title}</h2>
        <p style="color: #555; line-height: 1.6;">${message}</p>
        <br />
        <a href="https://eyelightpublishers.com/dashboard" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Dashboard</a>
        <br /><br />
        <p style="font-size: 12px; color: #888;">This is an automated notification from Eyelight Publishing.</p>
      </div>
    `;

    return this.mailService.send({
      to,
      subject: title,
      html,
    });
  }
}
