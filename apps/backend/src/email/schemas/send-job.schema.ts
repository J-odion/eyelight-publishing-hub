import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SendJobDocument = SendJob & Document;

@Schema({ timestamps: true })
export class SendJob {
  @Prop({ type: Types.ObjectId, ref: 'Contact', required: true })
  contactId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'EmailCampaign', default: null })
  campaignId: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, default: null })
  automationId: Types.ObjectId | null;

  @Prop({ required: true, enum: ['queued', 'processing', 'sent', 'failed', 'delivered', 'bounced', 'opened', 'clicked', 'complained'], default: 'queued' })
  status: string;

  @Prop({ type: String, default: null, sparse: true })
  resendId: string | null;

  @Prop({ type: String, default: null })
  providerMessageId: string | null;

  @Prop({ type: Number, default: 0 })
  attempts: number;

  @Prop({ type: Date, default: Date.now })
  nextAttemptAt: Date;
  
  @Prop({ type: Date, default: null })
  lastEventAt: Date | null;
}

export const SendJobSchema = SchemaFactory.createForClass(SendJob);
SendJobSchema.index({ status: 1, nextAttemptAt: 1 });
