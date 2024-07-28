import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GroupedUser } from './schema/groupUset.schema';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(GroupedUser.name) private groupedUserModel: Model<GroupedUser>,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }

  async groupUser(user: any) {
    try {
      await this.groupedUserModel.findOneAndUpdate(
        { location: user.location },
        { $push: { users: user._id } },
        { upsert: true, new: true },
      );
    } catch (error) {
      console.log('erro', error);
    }
  }
}
