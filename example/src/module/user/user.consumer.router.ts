import { communicator } from '@/communicator';
import { PromoCodeCreateToUserAfterFulfilledConditionPromotion } from './action/promocode_create_to_user_after_fulfilled_condition_promotion.action';

export const userConsumers: Record<string, (payload: Record<string, unknown>) => Promise<void>> = {
  order_metrics: async (payload) => {
    const { promoCodeSendToUserAfterFulfilledConditionPromotionConsumer } = await import(
      '@/module/user/consumer/promocode_create_to_user_after_fulfilled_condition_promotion.consumer'
    );

    await promoCodeSendToUserAfterFulfilledConditionPromotionConsumer({
      PromoCodeCreateToUserAfterFulfilledConditionPromotion,
      userCommunicator: communicator.user,
      payload,
    });
  },
};
