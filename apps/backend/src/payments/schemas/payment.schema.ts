import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum PaymentStatus {
  PENDING = 'Pending',
  SUCCESS = 'Success',
  FAILED = 'Failed'
}

@Schema({ timestamps: true })
export class Payment extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Manuscript' })
  project: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  reference: string; // Paystack transaction reference

  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Prop()
  purpose: string; // e.g. 'Submission Fee', 'Production Balance'
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
