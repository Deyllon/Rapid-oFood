import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PurchaseLogDocument = HydratedDocument<PurchaseLog>;

@Schema()
export class PurchaseLog {
  @Prop()
  store: string;
  @Prop()
  user: string;

  @Prop()
  dateTimeOfRegist: Date;
}

const PurchaseLogSchema = SchemaFactory.createForClass(PurchaseLog);
PurchaseLogSchema.index({ location: '2dsphere' });

export { PurchaseLogSchema };
