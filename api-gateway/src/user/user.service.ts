import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import { ClientKafka } from '@nestjs/microservices';
import { Login } from 'src/types/login.type';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @Inject('user_service') private readonly userClient: ClientKafka,
    @Inject('log_service') private readonly logClient: ClientKafka,
  ) {}
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const { latitude, longitude, ...rest } = createUserDto;
      const user = new this.userModel({
        location: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        ...rest,
      });
      const savedUser = await user.save();
      this.logClient.emit(
        'succesfulyRegister',
        JSON.stringify({
          user: user,
          dateTimeOfRegist: Date.now(),
        }),
      );
      this.userClient.emit(
        'group_user',
        JSON.stringify({
          user: user,
        }),
      );
      return savedUser;
    } catch (error) {
      this.logClient.emit(
        'register',
        JSON.stringify({
          error: error,
          dateTimeOfRegist: Date.now(),
        }),
      );
      console.log(error);
      throw new InternalServerErrorException('Try again later', {
        cause: new Error(),
        description: 'Something happened',
      });
    }
  }

  findOne(email: string, password: string): Promise<User> {
    return this.userModel.findOne({ email: email, password: password });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const user = await this.userModel.findByIdAndUpdate(id, updateUserDto);
      this.logClient.emit(
        'succesfulyUpdate',
        JSON.stringify({
          user: user,
          dateTimeOfRegist: Date.now(),
        }),
      );
      return user;
    } catch (error) {
      this.logClient.emit(
        'update',
        JSON.stringify({
          error: error,
          dateTimeOfRegist: Date.now(),
        }),
      );
      throw new InternalServerErrorException('Try again later', {
        cause: new Error(),
        description: 'Something happened',
      });
    }
  }

  async remove(id: number): Promise<User> {
    try {
      const deletedUser = await this.userModel.findByIdAndDelete(id);
      this.logClient.emit(
        'succesfulyDelete',
        JSON.stringify({
          user: deletedUser,
          dateTimeOfRegist: Date.now(),
        }),
      );
      return deletedUser;
    } catch (error) {
      this.logClient.emit(
        'delete',
        JSON.stringify({
          error: error,
          dateTimeOfRegist: Date.now(),
        }),
      );
      throw new InternalServerErrorException('Try again later', {
        cause: new Error(),
        description: 'Something happened',
      });
    }
  }

  async login(login: Login): Promise<User> {
    const user = await this.findOne(login.email, login.password);
    if (!user) {
      throw new BadRequestException('Wrong email or password', {
        cause: new Error(),
        description: 'Wrong email or password',
      });
    }
    this.logClient.emit(
      'login',
      JSON.stringify({
        userEmail: user.email,
        userAge: user.age,
        dateTimeOfLogin: Date.now(),
      }),
    );
    return user;
  }
}
