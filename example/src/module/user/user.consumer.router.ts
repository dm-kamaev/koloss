import { communicator } from '#/communicator';
import { ConsumerDescriptor } from '#/lib';

export const userConsumers: ConsumerDescriptor[] = [
  {
    name: 'promoCodeSendToUserAfterFulfilledConditionPromotion',
    topic: 'order_metrics',
    handler: async (payload) => {
      const { promoCodeSendToUserAfterFulfilledConditionPromotionConsumer } = await import(
        '#/module/user/consumer/promocode_create_to_user_after_fulfilled_condition_promotion.consumer'
      );
      const { PromoCodeCreateToUserAfterFulfilledConditionPromotion } = await import(
        '#user/action/promocode_create_to_user_after_fulfilled_condition_promotion.action'
      );

      await promoCodeSendToUserAfterFulfilledConditionPromotionConsumer({
        PromoCodeCreateToUserAfterFulfilledConditionPromotion,
        orderCommunicator: communicator.order,
        payload,
      });
    },
  },
];
