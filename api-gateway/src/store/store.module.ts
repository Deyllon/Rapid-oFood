import { Module } from '@nestjs/common';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Store, StoreSchema } from './schema/store.schema';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Store.name, schema: StoreSchema }]),
    ClientsModule.register([
      {
        name: 'log_service',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'log',
            brokers: [process.env.KAFKA || 'kafka:9092'],
          },
          consumer: {
            groupId: 'log-consumer',
          },
        },
      },
    ]),
  ],
  controllers: [StoreController],
  providers: [StoreService],
})
export class StoreModule {}
