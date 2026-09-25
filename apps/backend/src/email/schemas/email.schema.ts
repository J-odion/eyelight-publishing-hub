import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum EmailStatus {
  DRAFT = 'Draft',
  SCHEDULED = 'Scheduled',
  SENDING = 'Sending',
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

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Contact' }], default: [] })
  audienceContactIds: Types.ObjectId[]; // individual contacts

  @Prop({ type: [{ type: Types.ObjectId, ref: 'List' }], default: [] })
  audienceListIds: Types.ObjectId[]; // saved lists/groups

  @Prop({ type: String, enum: EmailStatus, default: EmailStatus.DRAFT })
  status: EmailStatus;

  @Prop({ type: Date })
  scheduledFor: Date;

  @Prop({ type: Date })
  sentAt: Date;

  @Prop({ type: Object, default: { queued: 0, sent: 0, failed: 0 } })
  stats: { queued: number; sent: number; failed: number };

  @Prop({ type: Object, default: null })
  builderData: any; // Raw GrapesJS state
}

export const EmailCampaignSchema = SchemaFactory.createForClass(EmailCampaign);
