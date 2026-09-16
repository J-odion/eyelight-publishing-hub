import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BookingDocument = Booking & Document;

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  EXPIRED = 'expired',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true })
export class Booking {
  @Prop({ required: true, unique: true })
  reference: string; // unique, generated at creation — also the Paystack tx reference

  @Prop({ required: true, type: Date })
  slotDate: Date;

  @Prop({ required: true })
  slotId: string; // whichever unit you're locking (a day, a time block, a consultation slot)

  @Prop({ required: true, enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  customerEmail: string;

  @Prop({ type: Date, default: Date.now })
  lockedAt: Date;

  @Prop({ type: Date, required: true })
  expiresAt: Date; // lockedAt + 30 minutes

  @Prop({ type: Date, default: null })
  verifiedAt: Date | null;

  @Prop({ type: Object, default: null })
  paystackData: object | null; // raw verify response, once you have it
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

// Compound unique index on { slotId, slotDate } where status is 'pending' or 'confirmed'
BookingSchema.index(
  { slotId: 1, slotDate: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
    },
  }
);
