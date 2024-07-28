import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type GroupedUserDocument = HydratedDocument<GroupedUser>;

@Schema()
export class GroupedUser {
  @Prop({
    type: {
      type: String,
    },
    coordinates: [],
  })
  location: number;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'User' }],
    required: true,
  })
  users: Types.ObjectId[];
}

const GroupedUserSchema = SchemaFactory.createForClass(GroupedUser);
GroupedUserSchema.index({ location: '2dsphere' });

export { GroupedUserSchema };
