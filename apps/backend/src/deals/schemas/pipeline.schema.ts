import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PipelineDocument = Pipeline & Document;

@Schema()
export class PipelineStage {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  order: number;
}
export const PipelineStageSchema = SchemaFactory.createForClass(PipelineStage);

@Schema({ timestamps: true })
export class Pipeline {
  @Prop({ required: true })
  name: string;

  @Prop({ type: [PipelineStageSchema], default: [] })
  stages: PipelineStage[];
}

export const PipelineSchema = SchemaFactory.createForClass(Pipeline);
