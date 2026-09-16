import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ListDocument = List & Document;

@Schema({ timestamps: true })
export class List {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['static', 'dynamic'], default: 'static' })
  type: string;

  @Prop({ type: Object, default: null })
  query: Record<string, any> | null; // e.g. { tags: 'author' } — only for dynamic
}

export const ListSchema = SchemaFactory.createForClass(List);
