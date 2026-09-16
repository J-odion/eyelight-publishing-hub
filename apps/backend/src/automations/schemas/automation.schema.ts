import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AutomationDocument = Automation & Document;

export enum AutomationEvent {
  USER_REGISTERED = 'user.registered',
  PAYMENT_COMPLETED = 'payment.completed',
  MANUSCRIPT_SUBMITTED = 'manuscript.submitted',
  PROJECT_STATUS_CHANGED = 'project.status_changed',
  CONSULTATION_BOOKED = 'consultation.booked',
}

@Schema({ timestamps: true })
export class Automation {
  @Prop({ required: true, unique: true, enum: AutomationEvent })
  triggerEvent: AutomationEvent;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  content: string; // HTML template

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Object, default: null })
  builderData: any; // Raw GrapesJS state
}

export const AutomationSchema = SchemaFactory.createForClass(Automation);
