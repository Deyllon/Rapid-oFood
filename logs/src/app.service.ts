import { Injectable } from '@nestjs/common';
import { RegisterUser } from './schema/registerLog.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RegisterStore } from './schema/registerStoreLog.schema';
import { DeletedStore } from './schema/deletedStoreLog.schema';
import { PurchaseLog } from './schema/succesfullPurchase.schema';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(RegisterUser.name)
    private registeUserModel: Model<RegisterUser>,
    @InjectModel(RegisterStore.name)
    private registeStoreModel: Model<RegisterStore>,
    @InjectModel(DeletedStore.name)
    private deleteStoreModel: Model<DeletedStore>,
    @InjectModel(PurchaseLog.name)
    private purchaseLogModel: Model<PurchaseLog>,
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
  async storeRegisterLog(data) {
    try {
      console.log(data);
      const registerStore = new this.registeStoreModel({
        ...data.store,
        dateTimeOfRegist: data.dateTimeOfRegist,
      });
      await registerStore.save();
    } catch (error) {
      console.log(error);
    }
  }

  async storeDeletedLog(data) {
    try {
      console.log(data);
      const deletedStore = new this.deleteStoreModel({
        email: data.store,
        dateTimeOfRegist: data.dateTimeOfRegist,
      });
      await deletedStore.save();
    } catch (error) {
      console.log(error);
    }
  }

  async purchaseLog(data) {
    try {
      console.log(data);
      const deletedStore = new this.purchaseLogModel({
        ...data.purchase,
        dateTimeOfRegist: data.dateTimeOfRegist,
      });
      await deletedStore.save();
    } catch (error) {
      console.log(error);
    }
  }
}
