import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum OrderStatus {
  PENDING = 'Pending',
  PAID = 'Paid',
  SHIPPED = 'Shipped',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled',
}

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop([{
    book: { type: Types.ObjectId, ref: 'Book' },
    quantity: { type: Number, default: 1 },
    priceAtPurchase: Number,
  }])
  items: { book: Types.ObjectId; quantity: number; priceAtPurchase: number }[];

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ type: String, enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Prop()
  paymentReference: string; // Paystack reference

  @Prop()
  shippingAddress: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
