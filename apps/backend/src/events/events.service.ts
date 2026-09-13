import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from './schemas/event.schema.js';
import { EmailService } from '../email/email.service.js';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<Event>,
    private emailService: EmailService,
  ) {}

  async findAll() {
    return this.eventModel.find().sort({ date: 1 }).exec();
  }

  async findOne(id: string) {
    const event = await this.eventModel.findById(id);
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async create(data: any) {
    const event = new this.eventModel(data);
    return event.save();
  }

  async register(id: string, body: { name: string; email: string; phone: string }) {
    const event = await this.eventModel.findById(id);
    if (!event) throw new NotFoundException('Event not found');

    event.registrations.push({ ...body, registeredAt: new Date() });
    await event.save();

    // Send confirmation email
    await this.emailService.sendEmail(
      body.email,
      `You're registered: ${event.title}`,
      `<p>Hi ${body.name},</p>
       <p>You have successfully registered for <strong>${event.title}</strong>.</p>
       <p><strong>Date:</strong> ${event.date.toDateString()}</p>
       <p><strong>Location:</strong> ${event.location || 'TBD'}</p>
       ${event.zoomLink ? `<p><strong>Join Link:</strong> <a href="${event.zoomLink}">${event.zoomLink}</a></p>` : ''}
       <p>We look forward to seeing you there!</p>
       <p>— The Eyelight Publishing Team</p>`,
    );

    return { message: 'Registration successful', event: event.title };
  }
}
