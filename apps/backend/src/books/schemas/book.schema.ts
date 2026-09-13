import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Book extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  author: string;

  @Prop()
  description: string;

  @Prop()
  genre: string;

  @Prop()
  coverUrl: string;

  @Prop()
  isbn: string;

  @Prop()
  price: number;

  @Prop()
  pages: number;

  @Prop()
  publicationDate: Date;

  @Prop([String])
  formats: string[]; // ['Paperback', 'Ebook', 'Hardcover']

  @Prop()
  targetAudience: string;

  @Prop()
  aboutAuthor: string;

  @Prop({ type: Object })
  purchaseLinks: {
    amazon?: string;
    eyelightStore?: string;
    jumia?: string;
    selar?: string;
  };

  @Prop({ default: true })
  isPublished: boolean;

  @Prop({ default: 0 })
  reviewCount: number;

  @Prop({ default: 0 })
  averageRating: number;
}

export const BookSchema = SchemaFactory.createForClass(Book);
