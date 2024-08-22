import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { ClientKafka } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { User } from './schema/user.schema';
import mongoose, { Model } from 'mongoose';
import { InternalServerErrorException } from '@nestjs/common';

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

      // Mock bcrypt.hash para retornar um valor hash
      jest
        .spyOn(bcrypt, 'hash')
        .mockResolvedValue(Promise.resolve('hashedPassword') as never);

      jest
        .spyOn(userModel, 'create')
        .mockImplementationOnce(() => Promise.resolve(savedUser));

      // Mock da instância retornada ao criar um novo documento com o modelo

      // Mock do construtor do modelo como um construtor que retorna a instância mockada

      // Invoca o serviço e verifica o resultado
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
});
