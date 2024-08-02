import { Injectable } from '@nestjs/common';
import { RegisterUser } from './schema/registerLog.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(RegisterUser.name)
    private registeUserModel: Model<RegisterUser>,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }

  async registerLog(data) {
    try {
      console.log(data);
      const registerUser = new this.registeUserModel({
        ...data.user,
        dateTimeOfRegist: data.dateTimeOfRegist,
      });
      await registerUser.save();
    } catch (error) {
      console.log(error);
    }
  }
}
