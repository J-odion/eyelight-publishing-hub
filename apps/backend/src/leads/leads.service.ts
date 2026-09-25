import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Lead, LeadType } from './schemas/lead.schema.js';
import { EmailService } from '../email/email.service.js';

@Injectable()
export class LeadsService {
  constructor(
    @InjectModel(Lead.name) private leadModel: Model<Lead>,
    private emailService: EmailService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(createLeadDto: any) {
    const lead = new this.leadModel(createLeadDto);
    await lead.save();

    // Trigger automated response based on lead type
    if (lead.type === LeadType.NEWSLETTER) {
      this.eventEmitter.emit('newsletter.subscribed', { email: lead.email, data: { name: lead.name } });
    } else if (lead.type === LeadType.CONSULTATION) {
      this.eventEmitter.emit('consultation.booked', { email: lead.email, data: { name: lead.name } });
    }

    return lead;
  }

  async findAll() {
    return this.leadModel.find().exec();
  }

  async bulkCreate(leads: any[]) {
    const documents = leads.map(l => ({
      ...l,
      type: l.type || LeadType.NEWSLETTER,
    }));
    return this.leadModel.insertMany(documents);
  }
}
