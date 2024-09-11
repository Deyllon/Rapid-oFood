import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DeletedStoreDocument = HydratedDocument<DeletedStore>;

@Schema()
export class DeletedStore {
  @Prop()
  email: string;
  @Prop()
  dateTimeOfRegist: Date;
}

const DeletedStoreSchema = SchemaFactory.createForClass(DeletedStore);
DeletedStoreSchema.index({ location: '2dsphere' });

export { DeletedStoreSchema };
