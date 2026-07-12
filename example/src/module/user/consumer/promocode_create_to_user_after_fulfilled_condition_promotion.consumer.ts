import { AsyncOK, OK } from '#/lib';
import { IOrderCommunicator } from '#/communicator/order.communicator.type';
import { PromoCodeCreateToUserAfterFulfilledConditionPromotionCtor } from '#user/action/promocode_create_to_user_after_fulfilled_condition_promotion.action';
import { PromoCodeSendToUserAfterFulfilledConditionPromotion } from '#user/decorator/promocode_send_to_user_after_fulfilled_condition_promotion.decorator';
import { OrderCreatedEventDto } from '#user/dto/order_created_event.dto';

export async function promoCodeSendToUserAfterFulfilledConditionPromotionConsumer({
  PromoCodeCreateToUserAfterFulfilledConditionPromotion,
  orderCommunicator,
  payload,
}: {
  PromoCodeCreateToUserAfterFulfilledConditionPromotion: PromoCodeCreateToUserAfterFulfilledConditionPromotionCtor;
  orderCommunicator: IOrderCommunicator;
  payload: Record<string, unknown>;
}): AsyncOK {
  const parsedPayload = await new OrderCreatedEventDto().act(payload);

  await new PromoCodeSendToUserAfterFulfilledConditionPromotion(
    new PromoCodeCreateToUserAfterFulfilledConditionPromotion(orderCommunicator),
  ).act(parsedPayload);

  return OK;
}
