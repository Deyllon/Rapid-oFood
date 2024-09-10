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
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @Inject('user_service') private readonly userClient: ClientKafka,
    @Inject('log_service') private readonly logClient: ClientKafka,
    private readonly jwtService: JwtService,
  ) {}
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const { latitude, longitude, password, ...rest } = createUserDto;
      const user = await this.userModel.create({
        location: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        password: await bcrypt.hash(password, 10),
        ...rest,
      });

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
      return user;
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
        cause: error,
        description: 'Something happened',
      });
    }
  }

  async findOne(email: string, password: string): Promise<User> {
    const user = await this.userModel.findOne({
      email: email,
    });
    if (!user) {
      throw new BadRequestException('Email incorreto');
    }
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      return user;
    }
    throw new BadRequestException('Senha invalida');
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
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
      throw new InternalServerErrorException(error.message, {
        cause: error,
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

  async login(login: Login): Promise<{ access_token: string }> {
    const user = await this.findOne(login.email, login.password);
    const payload = { sub: user.email, username: user.name };
    this.logClient.emit(
      'login',
      JSON.stringify({
        userEmail: user.email,
        userAge: user.age,
        dateTimeOfLogin: Date.now(),
      }),
    );
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
