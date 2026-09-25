import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AutomationsController } from './automations.controller.js';
import { AutomationsService } from './automations.service.js';
import { AutomationListener } from './automation.listener.js';
import { Automation, AutomationSchema } from './schemas/automation.schema.js';
import { Contact, ContactSchema } from '../crm/schemas/contact.schema.js';
import { MailModule } from '../mail/mail.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Automation.name, schema: AutomationSchema },
      { name: Contact.name, schema: ContactSchema }
    ]),
    MailModule,
  ],
  controllers: [AutomationsController],
  providers: [AutomationsService, AutomationListener],
  exports: [AutomationsService]
})
export class AutomationsModule {}
