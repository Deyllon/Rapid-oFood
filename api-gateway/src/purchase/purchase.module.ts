import { Module } from '@nestjs/common';
import { PurchaseController } from './purchase.controller';
import { PurchaseService } from './purchase.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { Purchase, PurchaseSchema } from './schema/purchase.schema';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'purchase_service',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'purchase',
            brokers: ['kafka:9092'],
          },
          consumer: {
            groupId: 'purchase-consumer',
          },
        },
      },
    ]),
    MongooseModule.forFeature([
      { name: Purchase.name, schema: PurchaseSchema },
    ]),
  ],
  controllers: [PurchaseController],
  providers: [PurchaseService],
})
export class PurchaseModule {}
