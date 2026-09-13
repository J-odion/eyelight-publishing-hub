import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeadsService } from './leads.service.js';
import { LeadsController } from './leads.controller.js';
import { Lead, LeadSchema } from './schemas/lead.schema.js';
import { EmailModule } from '../email/email.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Lead.name, schema: LeadSchema }]),
    EmailModule
  ],
  controllers: [LeadsController],
  providers: [LeadsService],
})
export class LeadsModule {}
