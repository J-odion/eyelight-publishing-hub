import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AutomationsController } from './automations.controller.js';
import { AutomationsService } from './automations.service.js';
import { AutomationListener } from './automation.listener.js';
import { Automation, AutomationSchema } from './schemas/automation.schema.js';
import { SendJob, SendJobSchema } from '../email/schemas/send-job.schema.js';
import { Contact, ContactSchema } from '../crm/schemas/contact.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Automation.name, schema: AutomationSchema },
      { name: SendJob.name, schema: SendJobSchema },
      { name: Contact.name, schema: ContactSchema }
    ])
  ],
  controllers: [AutomationsController],
  providers: [AutomationsService, AutomationListener],
  exports: [AutomationsService]
})
export class AutomationsModule {}
