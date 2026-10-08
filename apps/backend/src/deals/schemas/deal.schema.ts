import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DealDocument = Deal & Document;

@Schema({ timestamps: true })
export class Deal {
  @Prop({ required: true })
  title: string;

  @Prop({ type: Number, default: 0 })
  value: number;

  @Prop({ type: Types.ObjectId, ref: 'Contact', required: true, index: true })
  contactId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Pipeline', required: true, index: true })
  pipelineId: Types.ObjectId;

  @Prop({ required: true })
  stage: string;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null, index: true })
  ownerId: Types.ObjectId | null;

  @Prop({ type: String, enum: ['open', 'won', 'lost'], default: 'open' })
  status: string;
}

export const DealSchema = SchemaFactory.createForClass(Deal);
