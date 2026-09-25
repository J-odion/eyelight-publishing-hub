import { Injectable } from '@nestjs/common';
import { MailService } from '../mail.service.js';

@Injectable()
export class WelcomeEmailService {
  constructor(private readonly mailService: MailService) {}

  async send(to: string, name: string) {
    const html = `
      <div style="font-family: sans-serif; max-w-md; margin: auto;">
        <h2>Welcome to Eyelight Publishing, ${name}!</h2>
        <p>We are absolutely thrilled to have you join our author community.</p>
        <p>Your account is fully set up, and you can now log in to track your manuscript production and view upcoming events.</p>
        <br />
        <a href="https://eyelightpublishers.com/login" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Log in to your Dashboard</a>
        <br /><br />
        <p>Best regards,<br/>The Eyelight Team</p>
      </div>
    `;

    return this.mailService.send({
      to,
      subject: 'Welcome to Eyelight Publishing! 🎉',
      html,
    });
  }
}
