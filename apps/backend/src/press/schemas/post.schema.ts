import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Post extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  slug: string;

  @Prop()
  content: string; // HTML from React Quill

  @Prop()
  category: string;

  @Prop()
  coverImageUrl: string;

  @Prop({ required: true, min: 1, max: 6 })
  templateId: number; // 1 to 6

  @Prop({ default: false })
  isPublished: boolean;

  @Prop()
  publishedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  author: Types.ObjectId;
}

export const PostSchema = SchemaFactory.createForClass(Post);
