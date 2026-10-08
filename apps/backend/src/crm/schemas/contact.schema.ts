import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ContactDocument = Contact & Document;

@Schema({ timestamps: true })
export class Contact {
  @Prop({ required: true, unique: true, lowercase: true, index: true })
  email: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop({ type: Types.ObjectId, default: null })
  userId: Types.ObjectId | null;

  @Prop({ type: [String], default: [], index: true })
  tags: string[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'List' }], default: [] })
  listIds: Types.ObjectId[];

  @Prop({ required: true, enum: ['subscribed', 'unsubscribed'], default: 'subscribed', index: true })
  status: string;

  @Prop({ required: true, enum: ['signup', 'import', 'manuscript', 'payment', 'manual'], default: 'manual' })
  source: string;

  @Prop()
  phone: string;

  @Prop()
  company: string;

  @Prop()
  jobTitle: string;

  @Prop()
  address: string;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null, index: true })
  ownerId: Types.ObjectId | null;

  @Prop({ type: Number, default: 0 })
  leadScore: number;

  @Prop({ type: Object, default: {} })
  customAttributes: Record<string, any>;
}

export const ContactSchema = SchemaFactory.createForClass(Contact);
