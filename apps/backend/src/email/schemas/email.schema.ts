import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum EmailStatus {
  DRAFT = 'Draft',
  SCHEDULED = 'Scheduled',
  SENT = 'Sent'
}

@Schema({ timestamps: true })
export class EmailCampaign extends Document {
  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  content: string; // HTML content

  @Prop([String])
  audienceTags: string[]; // e.g. ['Newsletter', 'Author']

  @Prop({ type: String, enum: EmailStatus, default: EmailStatus.DRAFT })
  status: EmailStatus;

  @Prop({ type: Date })
  scheduledFor: Date;

  @Prop({ type: Date })
  sentAt: Date;
}

export const EmailCampaignSchema = SchemaFactory.createForClass(EmailCampaign);
