import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type PurchaseDocument = HydratedDocument<Purchase>;

@Schema()
export class Purchase {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Store' })
  store: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: mongoose.Schema.Types.ObjectId;

  @Prop({
    type: Date,
  })
  date: Date;

  @Prop({
    type: { type: String },
    coordinates: [],
  })
  userLocation: number;

  @Prop({
    type: { type: String },
    coordinates: [],
  })
  storeLocation: number;

  @Prop({
    type: String,
    enum: [
      'Pedido feito',
      'Pedido aceito',
      'Preparando',
      'Enviando',
      'Entregue',
    ],
    required: false,
    default: 'Pedido feito',
  })
  status: string;
}

const PurchaseSchema = SchemaFactory.createForClass(Purchase);

PurchaseSchema.index({ userLocation: '2dsphere' });

PurchaseSchema.index({ storeLocation: '2dsphere' });

export { PurchaseSchema };
