import { Injectable } from '@nestjs/common';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Purchase } from './schema/purchase.schema';
import { Model } from 'mongoose';

@Injectable()
export class PurchaseService {
  constructor(
    @InjectModel(Purchase.name) private readonly purchaseModel: Model<Purchase>
  )
  {}
  getHello(): string {
    return 'Hello World!';
  }

  buy(createPurchaseDto : CreatePurchaseDto){
    return this.purchaseModel.create(createPurchaseDto)
  }
}
