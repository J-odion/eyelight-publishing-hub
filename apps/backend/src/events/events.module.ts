import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventsController } from './events.controller.js';
import { EventsService } from './events.service.js';
import { Event, EventSchema } from './schemas/event.schema.js';
import { EmailModule } from '../email/email.module.js';
import { CloudinaryService } from '../cloudinary.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
    EmailModule,
  ],
  controllers: [EventsController],
  providers: [EventsService, CloudinaryService],
})
export class EventsModule {}
