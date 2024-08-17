import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { ClientKafka } from '@nestjs/microservices';
import { CreatePurchaseDto } from './dto/create-purchase.dto';

@Controller('purchase')
export class PurchaseController {
  constructor(
    private readonly purchaseService: PurchaseService,
  ) {}

  @Get()
  getHello(): string {
    return this.purchaseService.getHello();
  }

  @Post()
  buy(@Body() createPurchaseDto: CreatePurchaseDto){
    this.purchaseService.buy(createPurchaseDto)
  }
}
