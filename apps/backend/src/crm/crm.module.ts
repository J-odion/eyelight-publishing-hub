import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CrmController } from './crm.controller.js';
import { CrmService } from './crm.service.js';
import { CrmListener } from './crm.listener.js';
import { Contact, ContactSchema } from './schemas/contact.schema.js';
import { List, ListSchema } from './schemas/list.schema.js';
import { MailModule } from '../mail/mail.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Contact.name, schema: ContactSchema },
      { name: List.name, schema: ListSchema }
    ]),
    MailModule,
  ],
  controllers: [CrmController],
  providers: [CrmService, CrmListener],
  exports: [CrmService]
})
export class CrmModule {}
