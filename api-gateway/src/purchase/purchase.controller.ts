import { Controller, Get, Inject } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { ClientKafka } from '@nestjs/microservices';

@Controller('purchase')
export class PurchaseController {
  constructor(
    private readonly purchaseService: PurchaseService,
    @Inject('Teste_SERVICE') private readonly client: ClientKafka,
  ) {}

  async onModuleInit() {
    this.client.subscribeToResponseOf('teste');
    await this.client.connect();
  }

  @Get()
  getHello(): string {
    return this.purchaseService.getHello();
  }

  @Get('teste')
  async teste() {
    await this.client.emit('teste', JSON.stringify({ num: 460 }));
    console.log('sla');
    return;
  }
}
