import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupedUser, GroupedUserSchema } from './schema/groupUset.schema';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: 'mongodb://root:example@localhost:27017/',
      }),
    }),
    MongooseModule.forFeature([
      { name: GroupedUser.name, schema: GroupedUserSchema },
    ]),
    ClientsModule.register([
      {
        name: 'log_service',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'log',
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'log-consumer',
          },
        },
      },
    ])
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
