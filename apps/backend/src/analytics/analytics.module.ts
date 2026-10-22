import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsController } from './analytics.controller.js';
import { AnalyticsService } from './analytics.service.js';
import { Deal, DealSchema } from '../deals/schemas/deal.schema.js';
import { Activity, ActivitySchema } from '../activities/schemas/activity.schema.js';
import { Contact, ContactSchema } from '../crm/schemas/contact.schema.js';
import { Payment, PaymentSchema } from '../payments/schemas/payment.schema.js';
import { Lead, LeadSchema } from '../leads/schemas/lead.schema.js';
import { Booking, BookingSchema } from '../bookings/schemas/booking.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Deal.name, schema: DealSchema },
      { name: Activity.name, schema: ActivitySchema },
      { name: Contact.name, schema: ContactSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: Lead.name, schema: LeadSchema },
      { name: Booking.name, schema: BookingSchema },
    ])
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService]
})
export class AnalyticsModule {}
