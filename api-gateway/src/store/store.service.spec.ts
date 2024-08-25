import { Test, TestingModule } from '@nestjs/testing';
import { StoreService } from './store.service';
import mongoose, { Model } from 'mongoose';
import { Store } from './schema/store.schema';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { TypeOfFood } from './enum/typeOfFood.enum';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

describe('StoreService', () => {
  let service: StoreService;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let storeModel: Model<Store>;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let jwtServiceMock: JwtService;

  const savedStore: any = {
    _id: new mongoose.Types.ObjectId(),
    location: { type: 'Point', coordinates: [73.003, 32.7898] },
    name: 'hamburgueria',
    email: 'cardoso@gmail.com',
    typeOfFood: 'Mexican',
    password: 'hashedPassword',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreService,
        {
          provide: getModelToken(Store.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            skip: jest.fn(),
            limit: jest.fn(),
            findOne: jest.fn(),
            findOneAndUpdate: jest.fn(),
            deleteOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StoreService>(StoreService);
    storeModel = module.get<Model<Store>>(getModelToken(Store.name));
    jwtServiceMock = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createStore = {
      name: 'hamburgueria',
      latitude: 32.7898,
      longitude: 73.003,
      email: 'cardoso@gmail.com',
      password: '@Manha27',
      typeOfFood: 'Mexican' as TypeOfFood,
    };
    it('should create store', async () => {
      jest
        .spyOn(storeModel, 'create')
        .mockImplementationOnce(() => Promise.resolve(savedStore));
      jest
        .spyOn(bcrypt, 'hash')
        .mockResolvedValue(Promise.resolve('hashedPassword') as never);

      const result = await service.create(createStore);

      expect(bcrypt.hash).toHaveBeenCalledWith('@Manha27', 10);

      expect(result).toEqual(savedStore);
    });
    it('should throw  internal error', async () => {
      jest
        .spyOn(storeModel, 'create')
        .mockImplementationOnce(() => Promise.reject(new Error('mock error')));
      await expect(service.create(createStore)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('update', () => {
    const updateStore = {
      ...savedStore,
      name: 'henrique',
    };
    const newStore = {
      name: 'henrique',
    };
    it('should update store', async () => {
      jest.spyOn(storeModel, 'findOneAndUpdate').mockResolvedValue(updateStore);
      jest
        .spyOn(bcrypt, 'hash')
        .mockResolvedValue(Promise.resolve('hashedPassword') as never);

      const result = await service.update(savedStore.email, newStore);
      expect(storeModel.findOneAndUpdate).toHaveBeenCalledWith(
        { email: savedStore.email },
        { $set: { ...newStore } },
        { new: true },
      );

      expect(result.name).toEqual(newStore.name);
    });
    it('should throw internal error', async () => {
      jest
        .spyOn(storeModel, 'findOneAndUpdate')
        .mockRejectedValue(new InternalServerErrorException('error failed'));

      await expect(service.update(savedStore.email, newStore)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('remove', () => {
    it('should remove', async () => {
      jest.spyOn(storeModel, 'deleteOne').mockResolvedValue(savedStore);
      const result = await service.remove(savedStore.email);

      expect(storeModel.deleteOne).toHaveBeenCalledWith({
        email: savedStore.email,
      });

      expect(result).toEqual(savedStore);
    });

    it('should throw internal error', async () => {
      jest
        .spyOn(storeModel, 'deleteOne')
        .mockRejectedValue(new InternalServerErrorException('error failed'));

      await expect(service.remove(savedStore.email)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('find one', () => {
    it('should find one', async () => {
      jest.spyOn(storeModel, 'findOne').mockResolvedValue(savedStore);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));
      const result = await service.findOne(
        savedStore.email,
        savedStore.password,
      );

      expect(storeModel.findOne).toHaveBeenCalledWith({
        email: savedStore.email,
      });

      expect(result).toEqual(savedStore);
    });
    it('should throw bad request error', async () => {
      jest
        .spyOn(storeModel, 'findOne')
        .mockRejectedValue(new BadRequestException('Email incorreto'));
      await expect(
        service.findOne(savedStore.email, savedStore.password),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw bad request error', async () => {
      jest.spyOn(storeModel, 'findOne').mockResolvedValue(savedStore);
      jest.spyOn(bcrypt, 'compare').mockImplementationOnce(() => {
        throw new BadRequestException('Senha invalida');
      });

      await expect(
        service.findOne(savedStore.email, savedStore.password),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    const findMock = {
      skip: jest.fn().mockReturnThis(), // Retorna o próprio objeto para permitir encadeamento
      limit: jest.fn().mockResolvedValue([savedStore]), // Mock do retorno final com as lojas
    } as any;
    it('should find all', async () => {
      jest.spyOn(storeModel, 'find').mockReturnValue(findMock as any);
      const stores = await service.findAll(
        1,
        savedStore.latitude,
        savedStore.longitude,
        null,
        'Mexican' as TypeOfFood,
        'Mexican' as TypeOfFood,
      );

      expect(storeModel.find).toHaveBeenCalledWith({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [savedStore.longitude, savedStore.latitude],
            },
            $maxDistance: null,
          },
        },
        typeOfFood: 'Mexican',
      });

      expect(stores).toEqual([savedStore]);
    });
  });

  describe('login', () => {
    const token = 'mockToken';
    it('should login', async () => {
      jest.spyOn(storeModel, 'findOne').mockResolvedValue(savedStore);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));
      jest
        .spyOn(jwtServiceMock, 'signAsync')
        .mockReturnValue(Promise.resolve(token));
      const result = await service.login({
        email: savedStore.email,
        password: savedStore.password,
      });

      expect(storeModel.findOne).toHaveBeenCalledWith({
        email: savedStore.email,
      });
      expect(jwtServiceMock.signAsync).toHaveBeenCalledWith({
        sub: savedStore.email,
        username: savedStore.name,
      });
      expect(result).toEqual({ access_token: token });
    });
  });
});
