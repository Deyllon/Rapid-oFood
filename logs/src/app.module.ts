import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RegisterUser, RegisterUserSchema } from './schema/registerLog.schema';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  RegisterStore,
  RegisterStoreSchema,
} from './schema/registerStoreLog.schema';
import {
  DeletedStore,
  DeletedStoreSchema,
} from './schema/deletedStoreLog.schema';
import {
  PurchaseLog,
  PurchaseLogSchema,
} from './schema/succesfullPurchase.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_STRING'),
      }),
    }),
    MongooseModule.forFeature([
      { name: RegisterUser.name, schema: RegisterUserSchema },
    ]),

    MongooseModule.forFeature([
      { name: RegisterStore.name, schema: RegisterStoreSchema },
    ]),
    MongooseModule.forFeature([
      { name: DeletedStore.name, schema: DeletedStoreSchema },
    ]),
    MongooseModule.forFeature([
      { name: PurchaseLog.name, schema: PurchaseLogSchema },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
