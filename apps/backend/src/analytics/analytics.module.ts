import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsController } from './analytics.controller.js';
import { AnalyticsService } from './analytics.service.js';
import { Deal, DealSchema } from '../deals/schemas/deal.schema.js';
import { Activity, ActivitySchema } from '../activities/schemas/activity.schema.js';
import { Contact, ContactSchema } from '../crm/schemas/contact.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Deal.name, schema: DealSchema },
      { name: Activity.name, schema: ActivitySchema },
      { name: Contact.name, schema: ContactSchema }
    ])
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService]
})
export class AnalyticsModule {}
