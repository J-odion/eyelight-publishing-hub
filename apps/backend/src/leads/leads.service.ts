import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lead, LeadType } from './schemas/lead.schema.js';
import { EmailService } from '../email/email.service.js';

@Injectable()
export class LeadsService {
  constructor(
    @InjectModel(Lead.name) private leadModel: Model<Lead>,
    private emailService: EmailService,
  ) {}

  async create(createLeadDto: any) {
    const lead = new this.leadModel(createLeadDto);
    await lead.save();

    // Trigger automated response based on lead type
    if (lead.type === LeadType.NEWSLETTER) {
      await this.emailService.sendEmail(
        lead.email,
        'Welcome to the Eyelight Publishing Newsletter!',
        '<p>Thank you for subscribing. We will keep you updated with the best publishing insights.</p>'
      );
    } else if (lead.type === LeadType.CONSULTATION) {
      await this.emailService.sendEmail(
        lead.email,
        'Your Consultation Request is Confirmed',
        '<p>We have received your request for a publishing consultation. Our team will be in touch shortly to finalize the time.</p>'
      );
    }

    return lead;
  }

  async findAll() {
    return this.leadModel.find().exec();
  }
}
