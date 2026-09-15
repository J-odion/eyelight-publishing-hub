import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ProjectStatus {
  RECEIVED = 'Received',
  EDITING = 'Editing',
  COVER_DESIGN = 'Cover Design',
  PROOFREADING = 'Proofreading',
  PUBLISHED = 'Published'
}

@Schema({ timestamps: true })
export class Manuscript extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId;

  @Prop({ required: true })
  bookTitle: string;

  @Prop()
  genre: string;

  @Prop()
  wordCount: string;

  @Prop()
  targetAudience: string;

  @Prop()
  bookDescription: string;

  @Prop()
  authorBio: string;

  @Prop()
  previousPublications: string;

  @Prop()
  publishingPreference: string;

  @Prop()
  manuscriptFileUrl: string;

  @Prop([{ fileUrl: String, uploadedAt: Date }])
  versions: { fileUrl: string; uploadedAt: Date }[];

  @Prop()
  coverFileUrl: string;

  @Prop({ type: String, enum: ProjectStatus, default: ProjectStatus.RECEIVED })
  status: ProjectStatus;

  // Payments logic
  @Prop({ default: 0 })
  totalCost: number;

  @Prop({ default: 0 })
  amountPaid: number;
}

export const ManuscriptSchema = SchemaFactory.createForClass(Manuscript);
