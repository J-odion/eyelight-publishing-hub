import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum PressAssetType {
  PRESS_RELEASE = 'Press Release',
  AUTHOR_PHOTO = 'Author Photo',
  BOOK_COVER = 'Book Cover',
  AUTHOR_BIO = 'Author Bio',
  MEDIA_KIT = 'Media Kit',
  BRAND_ASSET = 'Brand Asset',
  INTERVIEW_REQUEST = 'Interview Request',
}

@Schema({ timestamps: true })
export class PressAsset extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ type: String, enum: PressAssetType, required: true })
  type: PressAssetType;

  @Prop()
  fileUrl: string; // URL to the downloadable file

  @Prop()
  thumbnailUrl: string; // Preview image

  @Prop()
  authorName: string; // If related to a specific author

  @Prop()
  bookTitle: string; // If related to a specific book

  @Prop({ default: true })
  isPublished: boolean;
}

export const PressAssetSchema = SchemaFactory.createForClass(PressAsset);
