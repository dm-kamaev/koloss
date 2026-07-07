import { communicator } from '#/communicator';
import { PromoCodeCreateToUserAfterFulfilledConditionPromotion } from './action/promocode_create_to_user_after_fulfilled_condition_promotion.action.js';

export interface ConsumerEntry {
  name: string;
  topic: string;
  handler: (payload: Record<string, unknown>) => Promise<void>;
}

export const userConsumers: ConsumerEntry[] = [
  {
    name: 'promoCodeSendToUserAfterFulfilledConditionPromotion',
    topic: 'order_metrics',
    handler: async (payload) => {
      const { promoCodeSendToUserAfterFulfilledConditionPromotionConsumer } = await import(
        '#/module/user/consumer/promocode_create_to_user_after_fulfilled_condition_promotion.consumer'
      );

      await promoCodeSendToUserAfterFulfilledConditionPromotionConsumer({
        PromoCodeCreateToUserAfterFulfilledConditionPromotion,
        orderCommunicator: communicator.order,
        payload,
      });
    },
  },
];
