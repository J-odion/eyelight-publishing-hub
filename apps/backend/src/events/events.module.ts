import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventsService } from './events.service.js';
import { EventsController } from './events.controller.js';
import { Event, EventSchema } from './schemas/event.schema.js';
import { EmailModule } from '../email/email.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
    EmailModule,
  ],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
