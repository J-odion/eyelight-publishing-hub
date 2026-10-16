import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum PaymentStatus {
  PENDING = 'Pending',
  SUCCESS = 'Success',
  FAILED = 'Failed',
  ABANDONED = 'Abandoned',
}

@Schema({ timestamps: true })
export class Payment extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  user?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Manuscript', required: false })
  project?: Types.ObjectId;

  @Prop({ required: true })
  amount: number; // in NGN

  @Prop({ required: true, unique: true, index: true })
  reference: string; // Paystack transaction reference

  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.PENDING, index: true })
  status: PaymentStatus;

  @Prop({ required: true })
  customerEmail: string;

  @Prop()
  customerName?: string;

  @Prop()
  customerPhone?: string;

  @Prop()
  purpose: string; // e.g. 'Storefront Order', 'Chief Editor 1:1 Consultation', 'Editor School Registration'

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop()
  channel?: string;

  @Prop({ type: Object })
  paystackData?: Record<string, any>;

  @Prop()
  paidAt?: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
