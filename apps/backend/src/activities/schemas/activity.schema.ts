import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ActivityDocument = Activity & Document;

@Schema({ timestamps: true })
export class Activity {
  @Prop({ required: true, enum: ['note', 'call', 'meeting', 'task'] })
  type: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: Date, default: null })
  dueDate: Date | null;

  @Prop({ type: String, enum: ['pending', 'completed'], default: 'completed' })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'Contact', required: true, index: true })
  contactId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Deal', default: null, index: true })
  dealId: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  ownerId: Types.ObjectId;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);
