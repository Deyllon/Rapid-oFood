import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { StoreService } from './store.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { TypeOfFood } from './enum/typeOfFood.enum';
import { Public } from 'src/decorators/public';
import { Login } from 'src/types/login.type';

@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Public()
  @Post()
  create(@Body() createStoreDto: CreateStoreDto) {
    return this.storeService.create(createStoreDto);
  }

  @Get()
  findAll(
    @Query('page') page: number,
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('maxDistance') maxDistance?: number,
    @Query('userType') userType?: TypeOfFood,
    @Query('groupUserType') groupUserType?: TypeOfFood,
  ) {
    return this.storeService.findAll(
      page,
      latitude,
      longitude,
      maxDistance,
      userType,
      groupUserType,
    );
  }

  @Public()
  @Post('login')
  login(@Body() login: Login) {
    return this.storeService.login(login);
  }

  @Patch(':email')
  update(
    @Param('email') email: string,
    @Body() updateStoreDto: UpdateStoreDto,
  ) {
    return this.storeService.update(email, updateStoreDto);
  }

  @Delete(':email')
  remove(@Param('email') email: string) {
    return this.storeService.remove(email);
  }
}
