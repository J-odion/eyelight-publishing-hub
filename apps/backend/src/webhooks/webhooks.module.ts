import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WebhooksController } from './webhooks.controller.js';
import { SendJob, SendJobSchema } from '../email/schemas/send-job.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SendJob.name, schema: SendJobSchema },
    ])
  ],
  controllers: [WebhooksController],
})
export class WebhooksModule {}
