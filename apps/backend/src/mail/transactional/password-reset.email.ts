import { Injectable } from '@nestjs/common';
import { MailService } from '../mail.service.js';

@Injectable()
export class PasswordResetEmailService {
  constructor(private readonly mailService: MailService) {}

  async send(to: string, resetToken: string) {
    const html = `
      <div style="font-family: sans-serif; max-w-md; margin: auto;">
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
        <br />
        <a href="https://eyelightpublishers.com/reset-password?token=${resetToken}" style="background-color: #d32f2f; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <br /><br />
        <p>This link will expire in 1 hour.</p>
        <p>Best regards,<br/>The Eyelight Team</p>
      </div>
    `;

    return this.mailService.send({
      to,
      subject: 'Reset your password - Eyelight Publishing',
      html,
    });
  }
}
