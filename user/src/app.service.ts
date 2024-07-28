import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GroupedUser } from './schema/groupUset.schema';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(GroupedUser.name) private groupedUserModel: Model<GroupedUser>,
    @Inject('log_service') private readonly logClient: ClientKafka,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }

  async groupUser(user: any) {
    try {
      const groupedUser = await this.groupedUserModel.aggregate([
        {
          $geoNear: {
            near: user.location,
            distanceField: 'dist.calculated',
            maxDistance: 5000,
            spherical: true,
          },
        },
      ]);

      if (!groupedUser.length) {
        return this.groupedUserModel.create({
          location: user.location,
          users: [user._id],
        });
      }

      const groupesUsersByLocation = groupedUser.find(
        (x) => x.users.length < 100,
      );
      return this.groupedUserModel.findOneAndUpdate(
        { location: groupesUsersByLocation.location },
        { $push: { users: user._id } },
        { upsert: true, new: true },
      );
    } catch (error) {
      this.logClient.emit(
        'groupUser',
        JSON.stringify({
          error: error,
          dateTimeOfRegist: Date.now(),
        }),
      );
      throw new InternalServerErrorException('Try again later', {
        cause: error,
        description: 'Something happened',
      });
    }
  }
}
