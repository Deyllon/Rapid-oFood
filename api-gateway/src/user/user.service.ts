import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @Inject('user_service') private readonly userClient: ClientKafka,
    @Inject('log_service') private readonly logClient: ClientKafka,
  ) {}
  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = new this.userModel(createUserDto);
    return user.save();
  }

  findOne(email: string, password: string): Promise<User> {
    return this.userModel.findOne({ email: email, password: password });
  }

  update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    return this.userModel.findByIdAndUpdate(id, updateUserDto);
  }

  remove(id: number): Promise<User> {
    return this.userModel.findByIdAndDelete(id);
  }

  async login(email: string, password: string): Promise<User> {
    const user = await this.findOne(email, password);
    if (!user) {
      throw new BadRequestException('wrong email or password', {
        cause: new Error(),
        description: 'wrong email or password',
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
