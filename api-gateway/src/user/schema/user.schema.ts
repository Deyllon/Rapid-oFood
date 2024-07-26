import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

function validateEmail(email: string): boolean {
  const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
}

@Schema()
export class User {
  @Prop()
  name: string;

  @Prop()
  age: number;

  @Prop()
  latitude: number;

  @Prop()
  longitude: number;

  @Prop({
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: true,
    validate: [validateEmail, 'Please fill a valid email address'],
  })
  email: string;
  @Prop()
  password: string;
  @Prop({
    type: String,
    enum: ['Mexica', 'Japanese', 'Brazilian', 'None'],
    required: false,
    default: 'None',
  })
  preference: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
