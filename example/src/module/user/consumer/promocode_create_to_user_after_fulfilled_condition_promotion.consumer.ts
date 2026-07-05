import { z } from 'zod';
import { AsyncOK } from '@/lib';
import { IOrderCommunicator } from '@/communicator/order.communicator.type';
import { PromoCodeCreateToUserAfterFulfilledConditionPromotionCtor } from '../action/promocode_create_to_user_after_fulfilled_condition_promotion.action';
import { PromoCodeSendToUserAfterFulfilledConditionPromotion } from '../decorator/promocode_send_to_user_after_fulfilled_condition_promotion.decorator';

function BulkOrderPayloadDto(payload: Record<string, unknown>) {
  const schema = z.object({
    userId: z.number().int().positive(),
    price: z.number().positive(),
  });

  return {
    act: () => schema.parseAsync(payload),
  };
}

export async function promoCodeSendToUserAfterFulfilledConditionPromotionConsumer({
  PromoCodeCreateToUserAfterFulfilledConditionPromotion,
  orderCommunicator,
  payload,
}: {
  PromoCodeCreateToUserAfterFulfilledConditionPromotion: PromoCodeCreateToUserAfterFulfilledConditionPromotionCtor;
  orderCommunicator: IOrderCommunicator;
  payload: Record<string, unknown>;
}): AsyncOK {
  const parsedPayload = await BulkOrderPayloadDto(payload).act();

  return await new PromoCodeSendToUserAfterFulfilledConditionPromotion(
    new PromoCodeCreateToUserAfterFulfilledConditionPromotion(orderCommunicator),
  ).act(parsedPayload);
}
