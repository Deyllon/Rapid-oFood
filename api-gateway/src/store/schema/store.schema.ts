import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type StoreDocument = HydratedDocument<Store>;

function validateEmail(email: string): boolean {
  const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
}

@Schema()
export class Store {
  @Prop({
    unique: true,
  })
  name: string;

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
    enum: ['Mexican', 'Japanese', 'Brazilian'],
    required: true,
    default: 'None',
  })
  typeOfFood: string;
}

const StoreSchema = SchemaFactory.createForClass(Store);

StoreSchema.index({ location: '2dsphere' });

export { StoreSchema };
