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

  @Prop({
    type: { type: String },
    coordinates: [],
  })
  location: number;
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
    enum: ['Mexican', 'Japanese', 'Brazilian', 'None'],
    required: false,
    default: 'None',
  })
  preference: string;
}

const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ location: '2dsphere' });

export { UserSchema };
