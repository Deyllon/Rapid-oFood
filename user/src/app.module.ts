import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupedUser, GroupedUserSchema } from './schema/groupUset.schema';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
