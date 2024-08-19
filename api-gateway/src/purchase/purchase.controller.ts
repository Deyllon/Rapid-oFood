import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';

@Controller('purchase')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Get(':id')
  getPurchase(@Param('id') store: string, @Query('date') date: Date) {
    return this.purchaseService.getPurchase(store, date);
  }

  @Get(':id')
  getFilteredPurchase(
    @Param('id') store: string,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    return this.purchaseService.getFilteredPurchase(store, startDate, endDate);
  }

  @Post()
  buy(@Body() createPurchaseDto: CreatePurchaseDto) {
    this.purchaseService.buy(createPurchaseDto);
  }
}
