import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { ClientKafka } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { User } from './schema/user.schema';
import mongoose, { Model } from 'mongoose';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let userModel: Model<User>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let logClient: ClientKafka;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let userClient: ClientKafka;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let jwtServiceMock: JwtService;

  const savedUser: any = {
    _id: new mongoose.Types.ObjectId(),
    location: { type: 'Point', coordinates: [73.003, 32.7898] },
    name: 'luan',
    email: 'cardoso@gmail.com',
    age: 23,
    password: 'hashedPassword',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken('User'),
          useValue: {
            create: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findOne: jest.fn(),
            findByIdAndDelete: jest.fn(),
            login: jest.fn(),
          },
        },
        {
          provide: 'user_service',
          useValue: { emit: jest.fn() },
        },
        {
          provide: 'log_service',
          useValue: { emit: jest.fn() },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userModel = module.get<Model<User>>(getModelToken('User'));
    logClient = module.get('log_service');
    userClient = module.get('user_service');
    jwtServiceMock = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUser = {
      name: 'luan',
      latitude: 32.7898,
      longitude: 73.003,
      email: 'cardoso@gmail.com',
      password: '@Manha27',
      age: 23,
    };
    it('should create user', async () => {
      jest
        .spyOn(userModel, 'create')
        .mockImplementationOnce(() => Promise.resolve(savedUser));
      jest
        .spyOn(bcrypt, 'hash')
        .mockResolvedValue(Promise.resolve('hashedPassword') as never);

      const result = await service.create(createUser);

      expect(bcrypt.hash).toHaveBeenCalledWith('@Manha27', 10);
      expect(logClient.emit).toHaveBeenCalledWith(
        'succesfulyRegister',
        expect.any(String),
      );
      expect(userClient.emit).toHaveBeenCalledWith(
        'group_user',
        expect.any(String),
      );
      expect(result).toEqual(savedUser);
    });

    it('should throw internal error', async () => {
      jest
        .spyOn(userModel, 'create')
        .mockImplementationOnce(() => Promise.reject());

      await expect(service.create(createUser)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('update', () => {
    const updateUser = {
      ...savedUser,
      name: 'henrique',
    };
    const newUser = {
      name: 'henrique',
    };
    it('should update user', async () => {
      jest.spyOn(userModel, 'findByIdAndUpdate').mockResolvedValue(updateUser);
      const result = await service.update(savedUser._id, newUser);

      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        savedUser._id,
        newUser,
      );

      expect(result.name).toEqual(newUser.name);
      expect(logClient.emit).toHaveBeenCalledWith(
        'succesfulyUpdate',
        expect.any(String),
      );
    });

    it('should throw internal error', async () => {
      jest
        .spyOn(userModel, 'findByIdAndUpdate')
        .mockRejectedValue(new Error('Update failed'));
      await expect(service.update(savedUser._id, updateUser)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(logClient.emit).toHaveBeenCalledWith('update', expect.any(String));
    });
  });

  describe('findOne', () => {
    it('should find one', async () => {
      jest.spyOn(userModel, 'findOne').mockResolvedValue(savedUser);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));
      const result = await service.findOne(savedUser.email, savedUser.password);

      expect(userModel.findOne).toHaveBeenCalledWith({
        email: savedUser.email,
      });

      expect(result.name).toEqual(savedUser.name);
    });

    it('should throw bad request error', async () => {
      jest
        .spyOn(userModel, 'findOne')
        .mockRejectedValue(new BadRequestException('Email incorreto'));
      await expect(
        service.findOne(savedUser.email, savedUser.password),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw bad request error', async () => {
      jest.spyOn(userModel, 'findOne').mockResolvedValue(savedUser);
      jest.spyOn(bcrypt, 'compare').mockImplementationOnce(() => {
        throw new BadRequestException('Senha invalida');
      });

      await expect(
        service.findOne(savedUser.email, savedUser.password),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove user', async () => {
      jest.spyOn(userModel, 'findByIdAndDelete').mockResolvedValue(savedUser);
      const result = await service.remove(savedUser.id);

      expect(userModel.findByIdAndDelete).toHaveBeenCalledWith(savedUser.id);

      expect(result.name).toEqual(savedUser.name);
      expect(logClient.emit).toHaveBeenCalledWith(
        'succesfulyDelete',
        expect.any(String),
      );
    });
    it('should throw InternalServerErrorException', async () => {
      jest
        .spyOn(userModel, 'findByIdAndDelete')
        .mockRejectedValue(new InternalServerErrorException('Try again later'));
      await expect(service.remove(savedUser.id)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(logClient.emit).toHaveBeenCalledWith('delete', expect.any(String));
    });
  });

  describe('login', () => {
    const token = 'mockToken';
    it('should login', async () => {
      jest.spyOn(userModel, 'findOne').mockResolvedValue(savedUser);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));
      jest
        .spyOn(jwtServiceMock, 'signAsync')
        .mockReturnValue(Promise.resolve(token));

      const result = await service.login({
        email: savedUser.email,
        password: savedUser.password,
      });

      expect(userModel.findOne).toHaveBeenCalledWith({
        email: savedUser.email,
      });
      expect(jwtServiceMock.signAsync).toHaveBeenCalledWith({
        sub: savedUser.email,
        username: savedUser.name,
      });
      expect(result).toEqual({ access_token: token });
      expect(logClient.emit).toHaveBeenCalledWith('login', expect.any(String));
    });
  });
});
