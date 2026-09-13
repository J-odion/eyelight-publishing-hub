import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum LeadType {
  CONSULTATION = 'Consultation',
  NEWSLETTER = 'Newsletter',
  LEAD_MAGNET = 'LeadMagnet'
}

@Schema({ timestamps: true })
export class Lead extends Document {
  @Prop({ required: true })
  email: string;

  @Prop()
  name: string;

  @Prop()
  phone: string;

  @Prop({ type: String, enum: LeadType, required: true })
  type: LeadType;

  @Prop({ type: Object })
  metadata: Record<string, any>; // Flexible for different lead forms (e.g. consultation date, magnet name)
}

export const LeadSchema = SchemaFactory.createForClass(Lead);
