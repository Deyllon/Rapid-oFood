import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import mongoose, { Connection } from 'mongoose';

@Injectable()
export class AppService {
  constructor(@InjectConnection() private connection: Connection) {}
  getHello(): string {
    return 'Hello World!';
  }

  async purchase(data: any) {
    try {
      const purchaseCollection = this.connection.collection('purchases');
      const storesCollection = this.connection.collection('stores');
      const usersCollection = this.connection.collection('users');

      const objectIdStore = new mongoose.Types.ObjectId(data.store as string);
      const objectIdUser = new mongoose.Types.ObjectId(data.user as string);
      const store = await storesCollection.findOne({
        _id: objectIdStore,
      });

      const user = await usersCollection.findOne({
        _id: objectIdUser,
      });

      await purchaseCollection.insertOne({
        store: objectIdStore,
        user: objectIdUser,
        date: data.date,
        userLocation: user.location,
        storeLocation: store.location,
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
