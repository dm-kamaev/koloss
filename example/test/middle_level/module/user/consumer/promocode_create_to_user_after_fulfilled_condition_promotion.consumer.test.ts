import { OK } from '@/lib';
import { promoCodeSendToUserAfterFulfilledConditionPromotionConsumer } from '@/module/user/consumer/promocode_create_to_user_after_fulfilled_condition_promotion.consumer';
import { PromoCodeCreateToUserAfterFulfilledConditionPromotion } from '@/module/user/action/promocode_create_to_user_after_fulfilled_condition_promotion.action';
import { emailClientInstance } from '@/core/email/email_client.instance';
import { z } from 'zod';

describe('Consumer: promoCodeSendToUserAfterFulfilledConditionPromotion', () => {
  let dispatchEmailSpy: jest.SpyInstance;

  beforeEach(async () => {
    dispatchEmailSpy = jest.spyOn(emailClientInstance, 'dispatch').mockReturnValue(undefined);
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(async () => {
    jest.restoreAllMocks();
  });

  it('should send promocode when countProducts > 10 and price >= 1000', async () => {
    const result = await promoCodeSendToUserAfterFulfilledConditionPromotionConsumer({
      PromoCodeCreateToUserAfterFulfilledConditionPromotion,
      userCommunicator: {
        getUserById: async () => ({ id: 1234, email: 'test@example.com' }),
        existUserWithId: async () => true,
      },
      payload: { userId: 1234, countProducts: 15, price: 1500 },
    });

    expect(result).toEqual(OK);
    expect(dispatchEmailSpy).toHaveBeenCalledTimes(1);
    expect(dispatchEmailSpy).toHaveBeenCalledWith('test@example.com', 'You earned a promocode!', expect.any(String));
  });

  it('should not send promocode when countProducts <= 10', async () => {
    const result = await promoCodeSendToUserAfterFulfilledConditionPromotionConsumer({
      PromoCodeCreateToUserAfterFulfilledConditionPromotion,
      userCommunicator: {
        getUserById: async () => ({ id: 1234, email: 'test@example.com' }),
        existUserWithId: async () => true,
      },
      payload: { userId: 1234, countProducts: 5, price: 1500 },
    });

    expect(result).toEqual(OK);
    expect(dispatchEmailSpy).not.toHaveBeenCalled();
  });

  it('should not send promocode when price < 1000', async () => {
    const result = await promoCodeSendToUserAfterFulfilledConditionPromotionConsumer({
      PromoCodeCreateToUserAfterFulfilledConditionPromotion,
      userCommunicator: {
        getUserById: async () => ({ id: 1234, email: 'test@example.com' }),
        existUserWithId: async () => true,
      },
      payload: { userId: 1234, countProducts: 15, price: 500 },
    });

    expect(result).toEqual(OK);
    expect(dispatchEmailSpy).not.toHaveBeenCalled();
  });

  it('should throw ZodError for invalid payload (userId not a number)', async () => {
    await expect(
      promoCodeSendToUserAfterFulfilledConditionPromotionConsumer({
        PromoCodeCreateToUserAfterFulfilledConditionPromotion,
        userCommunicator: {
          getUserById: async () => ({ id: 1234, email: 'test@example.com' }),
          existUserWithId: async () => true,
        },
        payload: { userId: 'abc', countProducts: 15, price: 1500 },
      }),
    ).rejects.toThrow(z.ZodError);
  });

  it('should throw ZodError for missing required field', async () => {
    await expect(
      promoCodeSendToUserAfterFulfilledConditionPromotionConsumer({
        PromoCodeCreateToUserAfterFulfilledConditionPromotion,
        userCommunicator: {
          getUserById: async () => ({ id: 1234, email: 'test@example.com' }),
          existUserWithId: async () => true,
        },
        payload: { userId: 1234, countProducts: 15 },
      }),
    ).rejects.toThrow(z.ZodError);
  });
});
