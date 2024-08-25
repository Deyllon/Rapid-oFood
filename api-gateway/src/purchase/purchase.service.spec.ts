import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseService } from './purchase.service';
import mongoose, { Model } from 'mongoose';
import { Purchase } from './schema/purchase.schema';
import { getModelToken } from '@nestjs/mongoose';
import { ClientKafka } from '@nestjs/microservices';
import { InternalServerErrorException } from '@nestjs/common';

describe('PurchaseService', () => {
  let service: PurchaseService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let purchaseModel: Model<Purchase>;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let purchaseClient: ClientKafka;

  const savedPurchase: any = {
    _id: new mongoose.Types.ObjectId(),
    store: new mongoose.Types.ObjectId(),
    user: new mongoose.Types.ObjectId(),
    date: '19/08/2024',
    userLocation: { type: 'Point', coordinates: [73.003, 32.7898] },
    storeLocation: { type: 'Point', coordinates: [73.003, 32.7898] },
    status: 'Pedido feito',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseService,
        {
          provide: getModelToken(Purchase.name),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: 'purchase_service',
          useValue: { emit: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<PurchaseService>(PurchaseService);
    purchaseModel = module.get<Model<Purchase>>(getModelToken(Purchase.name));

    purchaseClient = module.get('purchase_service');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPurchase', () => {
    it('should get purchase', async () => {
      jest.spyOn(purchaseModel, 'findOne').mockResolvedValue(savedPurchase);
      const result = await service.getPurchase(
        savedPurchase.store,
        savedPurchase.date,
      );

      expect(purchaseModel.findOne).toHaveBeenCalledWith({
        store: savedPurchase.store,
        date: savedPurchase.date,
      });
      expect(result).toEqual(savedPurchase);
    });
    it('should throw internal error', async () => {
      jest
        .spyOn(purchaseModel, 'findOne')
        .mockRejectedValue(
          new InternalServerErrorException('unexpected error '),
        );
      await expect(
        service.getPurchase(savedPurchase.store, savedPurchase.date),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('get filtered purchase', () => {
    it('should get filtered purchase', async () => {
      jest.spyOn(purchaseModel, 'findOne').mockResolvedValue(savedPurchase);

      const result = await service.getFilteredPurchase(
        savedPurchase.store,
        new Date('2024-08-18'),
        new Date('2024-08-23'),
      );

      expect(purchaseModel.findOne).toHaveBeenCalledWith({
        store: savedPurchase.store,
        date: {
          $gte: new Date('2024-08-18'),
          $lt: new Date('2024-08-23'),
        },
      });
      expect(result).toEqual(savedPurchase);
    });
    it('should throw internal error', async () => {
      jest
        .spyOn(purchaseModel, 'findOne')
        .mockRejectedValue(
          new InternalServerErrorException('unexpected error '),
        );
      await expect(
        service.getFilteredPurchase(
          savedPurchase.store,
          new Date('2024-08-18'),
          new Date('2024-08-23'),
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
  describe('buy', () => {
    const createPurchaseDto = {
      store: new mongoose.Types.ObjectId(),
      user: new mongoose.Types.ObjectId(),
      date: '19/08/2024',
    } as any;
    it('should buy', async () => {
      await service.buy(createPurchaseDto);
      expect(purchaseClient.emit).toHaveBeenCalledWith(
        'purchase',
        expect.any(String),
      );
    });
  });
});
