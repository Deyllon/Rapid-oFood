import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RegisterUserDocument = HydratedDocument<RegisterUser>;

@Schema()
export class RegisterUser {
  @Prop()
  name: string;

  @Prop()
  age: number;

  @Prop({
    type: { type: String },
    coordinates: [],
  })
  location: number;
  @Prop()
  email: string;
  @Prop()
  password: string;
  @Prop()
  preference: string;

  @Prop()
  dateTimeOfRegist: Date;
}

const RegisterUserSchema = SchemaFactory.createForClass(RegisterUser);
RegisterUserSchema.index({ location: '2dsphere' });

export { RegisterUserSchema };
