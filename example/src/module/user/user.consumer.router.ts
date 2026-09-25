import { ConsumerDescriptor } from '#/lib';
import { IOrderCommunicator } from '#/communicator/order.communicator.type';

export function userConsumers({ orderCommunicator }: { orderCommunicator: IOrderCommunicator }): ConsumerDescriptor[] {
  return [
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
          orderCommunicator,
          payload,
        });
      },
    },
  ];
}
