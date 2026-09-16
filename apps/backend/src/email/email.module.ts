import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailController } from './email.controller.js';
import { EmailService } from './email.service.js';
import { SendWorkerService } from './send-worker.service.js';
import { EmailCampaign, EmailCampaignSchema } from './schemas/email.schema.js';
import { SendJob, SendJobSchema } from './schemas/send-job.schema.js';
import { Contact, ContactSchema } from '../crm/schemas/contact.schema.js';
import { Automation, AutomationSchema } from '../automations/schemas/automation.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EmailCampaign.name, schema: EmailCampaignSchema },
      { name: SendJob.name, schema: SendJobSchema },
      { name: Contact.name, schema: ContactSchema },
      { name: Automation.name, schema: AutomationSchema }
    ])
  ],
  controllers: [EmailController],
  providers: [EmailService, SendWorkerService],
  exports: [EmailService]
})
export class EmailModule {}
