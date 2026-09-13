import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ReferralStatus {
  PENDING = 'Pending',       // Referred person signed up but hasn't completed onboarding
  COMPLETED = 'Completed',   // Referred person became a paying author
  CREDITED = 'Credited',     // Credit issued to the referrer
}

@Schema({ timestamps: true })
export class Referral extends Document {
  // The author who shared their referral link
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  referrer: Types.ObjectId;

  // The person who signed up through the link
  @Prop({ type: Types.ObjectId, ref: 'User' })
  referred: Types.ObjectId;

  @Prop({ required: true })
  referralCode: string;

  @Prop()
  referredEmail: string;

  @Prop({ type: String, enum: ReferralStatus, default: ReferralStatus.PENDING })
  status: ReferralStatus;

  @Prop({ default: 0 })
  creditAmount: number; // Amount in Naira credited to the referrer
}

export const ReferralSchema = SchemaFactory.createForClass(Referral);
