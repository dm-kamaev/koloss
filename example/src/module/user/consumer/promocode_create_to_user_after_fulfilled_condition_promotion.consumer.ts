import { z } from 'zod';
import { AsyncOK } from '@/lib';
import { IUserCommunicator } from '@/communicator/user.communicator.type';
import { PromoCodeCreateToUserAfterFulfilledConditionPromotionCtor } from '../action/promocode_create_to_user_after_fulfilled_condition_promotion.action';
import { PromoCodeSendToUserAfterFulfilledConditionPromotion } from '../decorator/promocode_send_to_user_after_fulfilled_condition_promotion.decorator';

function BulkOrderPayloadDto(payload: Record<string, unknown>) {
  const schema = z.object({
    userId: z.number().int().positive(),
    countProducts: z.number().int().positive(),
    price: z.number().positive(),
  });

  return {
    act: () => schema.parseAsync(payload),
  };
}

export async function promoCodeSendToUserAfterFulfilledConditionPromotionConsumer({
  PromoCodeCreateToUserAfterFulfilledConditionPromotion,
  userCommunicator,
  payload,
}: {
  PromoCodeCreateToUserAfterFulfilledConditionPromotion: PromoCodeCreateToUserAfterFulfilledConditionPromotionCtor;
  userCommunicator: IUserCommunicator;
  payload: Record<string, unknown>;
}): AsyncOK {
  const parsedPayload = await BulkOrderPayloadDto(payload).act();

  return await new PromoCodeSendToUserAfterFulfilledConditionPromotion(
    new PromoCodeCreateToUserAfterFulfilledConditionPromotion(userCommunicator),
  ).act(parsedPayload);
}
