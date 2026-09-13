import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum Role {
  USER = 'user',
  AUTHOR = 'author',
  ADMIN = 'admin',
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  email: string;

  @Prop()
  password?: string; // Optional initially if they just submitted data without account

  @Prop()
  name: string;

  @Prop()
  phone: string;

  @Prop({ type: String, enum: Role, default: Role.USER })
  role: Role;

  // Track if they have completed the author onboarding flow
  @Prop({ default: false })
  isAuthorOnboarded: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
