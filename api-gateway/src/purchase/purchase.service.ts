import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Purchase } from './schema/purchase.schema';
import { Model } from 'mongoose';
import { response } from 'express';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class PurchaseService {
  constructor(
    @InjectModel(Purchase.name) private readonly purchaseModel: Model<Purchase>,
    @Inject('purchase_service') private readonly purchase_service: ClientKafka,
    @Inject('log_service') private readonly logClient: ClientKafka,
  ) {}
  getPurchase(store: string, date: Date) {
    try {
      return this.purchaseModel.findOne({
        store: store,
        date: date,
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message, {
        cause: error,
        description: 'Something happened',
      });
    }
  }

  getFilteredPurchase(store: string, startDate: Date, endDate: Date) {
    try {
      return this.purchaseModel.findOne({
        store: store,
        date: {
          $gte: startDate,
          $lt: endDate,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message, {
        cause: error,
        description: 'Something happened',
      });
    }
  }

  buy(createPurchaseDto: CreatePurchaseDto) {
    try {
      this.purchase_service.emit(
        'purchase',
        JSON.stringify({
          order: createPurchaseDto,
        }),
      );

      this.logClient.emit(
        'purchaseCompleted',
        JSON.stringify({
          purchase: createPurchaseDto,
          dateTimeOfRegist: Date.now(),
        }),
      );

      return response.status(200);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
