import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DealsController } from './deals.controller.js';
import { DealsService } from './deals.service.js';
import { Deal, DealSchema } from './schemas/deal.schema.js';
import { Pipeline, PipelineSchema } from './schemas/pipeline.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Deal.name, schema: DealSchema },
      { name: Pipeline.name, schema: PipelineSchema }
    ])
  ],
  controllers: [DealsController],
  providers: [DealsService]
})
export class DealsModule {}
