import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Event extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  date: Date;

  @Prop()
  location: string; // 'Online' or physical venue

  @Prop()
  zoomLink: string;

  @Prop()
  coverUrl: string;

  @Prop()
  flyerUrl: string; // Phase 2: Optional image upload for events flyer

  @Prop({ type: String, enum: ['Launch', 'Workshop', 'Webinar', 'BookClub', 'Masterclass'], default: 'Workshop' })
  type: string;

  @Prop({ default: false })
  isFreeForAuthors: boolean;

  @Prop({ default: 0 })
  price: number;

  @Prop([{ name: String, email: String, phone: String, registeredAt: Date }])
  registrations: { name: string; email: string; phone: string; registeredAt: Date }[];
}

export const EventSchema = SchemaFactory.createForClass(Event);
