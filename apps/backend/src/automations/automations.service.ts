import { Injectable, NotFoundException } from '@nestjs/common';
import juice from 'juice';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Automation, AutomationDocument, AutomationEvent } from './schemas/automation.schema.js';

@Injectable()
export class AutomationsService {
  constructor(
    @InjectModel(Automation.name) private automationModel: Model<AutomationDocument>,
  ) {}

  async onModuleInit() {
    await this.seedDefaults();
  }

  async seedDefaults() {
    const defaults = [
      {
        triggerEvent: AutomationEvent.COURSE_PAYMENT_CONFIRMED,
        subject: 'Welcome to The Book Editor Business School, {{name}}!',
        content: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; line-height: 1.6;">
  <p style="font-size: 16px;">Hello {{name}},</p>
  <p style="font-size: 16px;">Thank you for registering for the December 2026 cohort of The Book Editor Business School.</p>
  <p style="font-size: 16px;">Your payment has been received, and your place in the cohort is confirmed. I’m glad to have you join us!</p>
  <p style="font-size: 16px;">Between December 4 and 6, we’ll be working on how to build a profitable editing business from the experience you already have. You are about to have a most thrilling experience, trust me!</p>
  <p style="font-size: 16px;">Now, you don’t have to wait until December to start getting ready.</p>
  <p style="font-size: 16px;">For now, keep an eye on your inbox for updates, important information about the classes, and details about your induction. We’ll share everything you need to know before the training begins.</p>
  <div style="background-color: #f8fafc; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
    <p style="margin: 0 0 8px 0; font-weight: bold; color: #0f172a;">Here are the key dates to keep in mind:</p>
    <ul style="margin: 0; padding-left: 20px; color: #334155;">
      <li style="margin-bottom: 4px;"><strong>December 4–6, 2026:</strong> Three-day training</li>
      <li style="margin-bottom: 4px;"><strong>December 4:</strong> Induction at 5 PM WAT</li>
      <li><strong>December 7:</strong> Graduation at 7 PM WAT</li>
    </ul>
  </div>
  <p style="font-size: 16px;">We’re looking forward to having you in class.</p>
  <p style="font-size: 16px; font-weight: bold; color: #b45309;">Welcome to The Book Editor Business School!</p>
  <p style="font-size: 16px; margin-top: 24px;">Warm regards,<br/><strong>Grace Akowe Apara</strong><br/><span style="color: #64748b; font-size: 14px;">Lead Instructor</span></p>
</div>`,
        isActive: true,
      },
      {
        triggerEvent: AutomationEvent.CONSULTATION_BOOKED,
        subject: 'Chief Editor 1:1 Consultation Confirmed — Eyelight Publishing',
        content: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; line-height: 1.6;">
  <p style="font-size: 16px;">Hello {{name}},</p>
  <p style="font-size: 16px;">Thank you for booking your Chief Editor 1:1 Consultation with Eyelight Publishing!</p>
  <p style="font-size: 16px;">Your payment has been received, and your consultation session is confirmed. We are excited to collaborate with you on your book project.</p>
  <div style="background-color: #f8fafc; border-left: 4px solid #0284c7; padding: 16px; margin: 20px 0; border-radius: 4px;">
    <p style="margin: 0 0 8px 0; font-weight: bold; color: #0f172a;">Booking Summary:</p>
    <ul style="margin: 0; padding-left: 20px; color: #334155;">
      <li style="margin-bottom: 4px;"><strong>Service:</strong> Chief Editor 1:1 Book Clarity Consultation (45 minutes)</li>
      <li style="margin-bottom: 4px;"><strong>Session Schedule:</strong> {{slotDate}} at {{slotTime}} (WAT)</li>
      <li><strong>Mode:</strong> One-on-one private call (Meeting link sent prior to call)</li>
    </ul>
  </div>
  <div style="background-color: #fffbeb; border: 1px solid #fef3c7; padding: 16px; border-radius: 8px; margin: 20px 0;">
    <p style="margin: 0 0 6px 0; font-weight: bold; color: #92400e;">Next Step: Pre-Consultation Brief</p>
    <p style="margin: 0 0 10px 0; font-size: 14px; color: #78350f;">To make the most of our session, please complete the brief so our Chief Editor can review your manuscript details ahead of time:</p>
    <a href="https://eyelightpublishers.com/pre-consultation-form" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; font-size: 14px;">Fill Pre-Consultation Brief &rarr;</a>
  </div>
  <p style="font-size: 15px; color: #64748b;">If you need to make adjustments or have questions, simply reply directly to this email or chat with our team on WhatsApp at <a href="https://wa.me/2348146682688" style="color: #0284c7;">+234 814 668 2688</a>.</p>
  <p style="font-size: 16px; margin-top: 24px;">Warm regards,<br/><strong>Grace Akowe Apara</strong><br/><span style="color: #64748b; font-size: 14px;">Lead Editor &amp; Publisher, Eyelight Publishing</span></p>
</div>`,
        isActive: true,
      },
      {
        triggerEvent: AutomationEvent.PAYMENT_ABANDONED,
        subject: 'Complete your registration — Eyelight Publishing',
        content: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; line-height: 1.6;">
  <p style="font-size: 16px;">Hello {{name}},</p>
  <p style="font-size: 16px;">I noticed you started your registration for {{purpose}}, but didn't quite get to complete your payment.</p>
  <p style="font-size: 16px;">Slots are limited to keep cohort sizes intimate and impactful. If you ran into any technical issues or need help completing your payment, we're here to assist.</p>
  <div style="text-align: center; margin: 28px 0;">
    <a href="{{checkoutUrl}}" style="display: inline-block; background-color: #f59e0b; color: #0f172a; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; font-size: 15px; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);">Complete Your Registration &rarr;</a>
  </div>
  <p style="font-size: 15px; color: #64748b;">If you have any questions, prefer an alternative payment option, or need direct assistance, reply directly to this email at <a href="mailto:services@eyelightpublishers.com" style="color: #0284c7;">services@eyelightpublishers.com</a> or message our team on WhatsApp at <a href="https://wa.me/2348146682688" style="color: #0284c7;">+234 814 668 2688</a>.</p>
  <p style="font-size: 16px; margin-top: 24px;">We'd love to have you join us!</p>
  <p style="font-size: 16px; margin-top: 20px;">Warm regards,<br/><strong>Grace Akowe Apara</strong><br/><span style="color: #64748b; font-size: 14px;">Eyelight Publishing</span></p>
</div>`,
        isActive: true,
      },
      {
        triggerEvent: AutomationEvent.PAYMENT_COMPLETED,
        subject: 'Payment Confirmed — Eyelight Publishing',
        content: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; line-height: 1.6;">
  <p style="font-size: 16px;">Hello {{name}},</p>
  <p style="font-size: 16px;">We have received your payment of <strong>{{amount}}</strong> for <strong>{{purpose}}</strong>.</p>
  <p style="font-size: 16px;">Your transaction reference is: <code style="background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-weight: bold;">{{reference}}</code>.</p>
  <p style="font-size: 16px;">Thank you for your business. If your payment is for a book project, consultation, or school, our team is already processing your order.</p>
  <p style="font-size: 16px; margin-top: 24px;">Warm regards,<br/><strong>Eyelight Publishing</strong><br/><span style="color: #64748b; font-size: 14px;">services@eyelightpublishers.com</span></p>
</div>`,
        isActive: true,
      },
      {
        triggerEvent: AutomationEvent.NEWSLETTER_SUBSCRIBED,
        subject: 'Welcome to Eyelight Publishing!',
        content: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; line-height: 1.6;">
  <p style="font-size: 16px;">Hello {{name}},</p>
  <p style="font-size: 16px;">Thank you for subscribing to Eyelight Publishing. You are now part of a community dedicated to structured, intentional, and credible publishing.</p>
  <p style="font-size: 16px;">We share practical publishing frameworks, author guides, editor insights, and exclusive invitations to upcoming schools and workshops.</p>
  <p style="font-size: 16px; margin-top: 24px;">Warm regards,<br/><strong>Eyelight Publishing</strong><br/><span style="color: #64748b; font-size: 14px;">services@eyelightpublishers.com</span></p>
</div>`,
        isActive: true,
      },
    ];

    for (const d of defaults) {
      const existing = await this.automationModel.findOne({ triggerEvent: d.triggerEvent });
      if (!existing) {
        await this.automationModel.create(d);
      }
    }
  }

  async findAll() {
    await this.seedDefaults();
    return this.automationModel.find().exec();
  }

  async findOneByEvent(triggerEvent: string) {
    return this.automationModel.findOne({ triggerEvent: triggerEvent as AutomationEvent }).exec();
  }

  async upsertAutomation(triggerEvent: string, data: Partial<Automation>) {
    if (data.content) {
      data.content = juice(data.content);
    }
    return this.automationModel.findOneAndUpdate(
      { triggerEvent: triggerEvent as AutomationEvent },
      { $set: data },
      { new: true, upsert: true }
    ).exec();
  }

  async remove(id: string) {
    const automation = await this.automationModel.findByIdAndDelete(id);
    if (!automation) throw new NotFoundException('Automation not found');
    return automation;
  }
}
