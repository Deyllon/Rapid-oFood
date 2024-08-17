import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type PurchaseDocument = HydratedDocument<Purchase>;

@Schema()
export class Purchase {
    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'Store'})
    store:mongoose.Schema.Types.ObjectId;

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'User'})
    user:mongoose.Schema.Types.ObjectId;

    @Prop({
        type: Date
    })
    date: Date
  
}

const PurchaseSchema = SchemaFactory.createForClass(Purchase);


export { PurchaseSchema };
