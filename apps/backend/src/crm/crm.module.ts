import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CrmController } from './crm.controller.js';
import { CrmService } from './crm.service.js';
import { Contact, ContactSchema } from './schemas/contact.schema.js';
import { List, ListSchema } from './schemas/list.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Contact.name, schema: ContactSchema },
      { name: List.name, schema: ListSchema }
    ]),
  ],
  controllers: [CrmController],
  providers: [CrmService],
  exports: [CrmService]
})
export class CrmModule {}
