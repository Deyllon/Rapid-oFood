import { Module } from '@nestjs/common';
import { PurchaseController } from './purchase.controller';
import { PurchaseService } from './purchase.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'Teste_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'teste',
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'teste-consumer',
          },
        },
      },
    ]),
  ],
  controllers: [PurchaseController],
  providers: [PurchaseService],
})
export class PurchaseModule {}
