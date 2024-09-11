import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { EventPattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @EventPattern('succesfulyRegister')
  registerLog(data: any) {
    this.appService.registerLog(data);
  }

  @EventPattern('storeSuccesfulyRegister')
  storeRegisterLog(data: any) {
    this.appService.storeRegisterLog(data);
  }

  @EventPattern('storeSuccesfulyDeleted')
  storeDeletedLog(data: any) {
    this.appService.storeDeletedLog(data);
  }

  @EventPattern('purchaseCompleted')
  purchaseLog(data: any) {
    this.appService.purchaseLog(data);
  }
}
