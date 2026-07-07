import { OK } from '#/lib';
import { testTransaction } from 'pg-transactional-tests';
import { promoCodeSendToUserAfterFulfilledConditionPromotionConsumer } from '#/module/user/consumer/promocode_create_to_user_after_fulfilled_condition_promotion.consumer';
import { emailClientInstance } from '#/core/email/email_client.instance';
import { z } from 'zod';
import { createMockClass } from '#/lib_test';
import { pgConnect } from '#/core/pg/pg.instance';
import { AppCommunicatorFake } from '#test/fake/communicator';
import { OrderCommunicatorFake } from '#test/fake/module/order/order.communicator';
import { UserDbFake } from '#test/fake/module/user/repository/user.db fake';
import { PromoCodeCreateToUserAfterFulfilledConditionPromotion } from '#/module/user/action/promocode_create_to_user_after_fulfilled_condition_promotion.action';

describe('Consumer: promoCodeSendToUserAfterFulfilledConditionPromotion', () => {
  let dispatchEmailSpy: jest.SpyInstance;

  beforeEach(async () => {
    dispatchEmailSpy = jest.spyOn(emailClientInstance, 'dispatch').mockReturnValue(undefined);
    jest.spyOn(console, 'log').mockImplementation(() => {});

    await pgConnect.rebuild();
    await testTransaction.start();
  });

  afterEach(async () => {
    await testTransaction.rollback();
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await pgConnect.destroy();
  });

  it('should send promocode when user has 10+ orders with price above 1000', async () => {
    const OrderCommunicatorCtor = createMockClass(OrderCommunicatorFake, {
      getCountUserOrdersWithPriceAbove: async () => 15,
    });

    const result = await promoCodeSendToUserAfterFulfilledConditionPromotionConsumer({
      PromoCodeCreateToUserAfterFulfilledConditionPromotion,
      orderCommunicator: new AppCommunicatorFake({ OrderCommunicatorCtor }).order,
      payload: { userId: UserDbFake.defaultUser.id, price: 1500 },
    });

    expect(result).toEqual(OK);
    expect(dispatchEmailSpy).toHaveBeenCalledTimes(1);
    expect(dispatchEmailSpy).toHaveBeenCalledWith(UserDbFake.defaultUser.email, 'You earned a promocode!', expect.any(String));
  });

  it('should not send promocode when user has less than 10 orders with price above 1000', async () => {
    const OrderCommunicatorCtor = createMockClass(OrderCommunicatorFake, {
      getCountUserOrdersWithPriceAbove: async () => 5,
    });

    const result = await promoCodeSendToUserAfterFulfilledConditionPromotionConsumer({
      PromoCodeCreateToUserAfterFulfilledConditionPromotion,
      orderCommunicator: new AppCommunicatorFake({ OrderCommunicatorCtor }).order,
      payload: { userId: UserDbFake.defaultUser.id, price: 1500 },
    });

    expect(result).toEqual(OK);
    expect(dispatchEmailSpy).not.toHaveBeenCalled();
  });

  it('should not send promocode when user has 0 orders with price above 1000', async () => {
    const OrderCommunicatorCtor = createMockClass(OrderCommunicatorFake, {
      getCountUserOrdersWithPriceAbove: async () => 0,
    });

    const result = await promoCodeSendToUserAfterFulfilledConditionPromotionConsumer({
      PromoCodeCreateToUserAfterFulfilledConditionPromotion,
      orderCommunicator: new AppCommunicatorFake({ OrderCommunicatorCtor }).order,
      payload: { userId: UserDbFake.defaultUser.id, price: 500 },
    });

    expect(result).toEqual(OK);
    expect(dispatchEmailSpy).not.toHaveBeenCalled();
  });
});

describe('Consumer: promoCodeSendToUserAfterFulfilledConditionPromotion [Validation]', () => {
  beforeEach(async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(async () => {
    jest.restoreAllMocks();
  });

  it('should throw a ZodError for invalid payload (userId not a number)', async () => {
    await expect(
      promoCodeSendToUserAfterFulfilledConditionPromotionConsumer({
        PromoCodeCreateToUserAfterFulfilledConditionPromotion,
        orderCommunicator: new AppCommunicatorFake().order,
        payload: { userId: 'abc', price: 1500 },
      }),
    ).rejects.toThrow(z.ZodError);
  });

  it('should throw a ZodError for missing required field', async () => {
    await expect(
      promoCodeSendToUserAfterFulfilledConditionPromotionConsumer({
        PromoCodeCreateToUserAfterFulfilledConditionPromotion,
        orderCommunicator: new AppCommunicatorFake().order,
        payload: { userId: 1234 },
      }),
    ).rejects.toThrow(z.ZodError);
  });
});
