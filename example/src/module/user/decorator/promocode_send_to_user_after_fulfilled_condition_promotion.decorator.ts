import { AsyncOK, OK } from '@/lib';
import { PromoCodeCreateToUserAfterFulfilledConditionPromotion } from '../action/promocode_create_to_user_after_fulfilled_condition_promotion.action';

export class PromoCodeSendToUserAfterFulfilledConditionPromotion {
  constructor(
    private readonly promoCodeCreateToUserAfterFulfilledConditionPromotion: PromoCodeCreateToUserAfterFulfilledConditionPromotion,
  ) {}

  async act(data: { userId: number; countProducts: number; price: number }): AsyncOK {
    const promocode = await this.promoCodeCreateToUserAfterFulfilledConditionPromotion.act(data);

    if (!promocode) {
      return OK;
    }

    await promocode.sendToUserViaEmail({
      subject: 'You earned a promocode!',
      body: (code) => `Thank you for your bulk order! Here is your promocode: ${code}`,
    });

    return OK;
  }
}
