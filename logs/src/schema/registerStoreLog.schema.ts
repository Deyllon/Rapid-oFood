import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RegisterStoreDocument = HydratedDocument<RegisterStore>;

@Schema()
export class RegisterStore {
  @Prop()
  name: string;

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
  typeOfFood: string;

  @Prop()
  dateTimeOfRegist: Date;
}

const RegisterStoreSchema = SchemaFactory.createForClass(RegisterStore);
RegisterStoreSchema.index({ location: '2dsphere' });

export { RegisterStoreSchema };
