import { PromoCodeCreateToUserAfterFulfilledConditionPromotion } from '../action/promocode_create_to_user_after_fulfilled_condition_promotion.action';

export class PromoCodeSendToUserAfterFulfilledConditionPromotion {
  constructor(
    private readonly promoCodeCreateToUserAfterFulfilledConditionPromotion: PromoCodeCreateToUserAfterFulfilledConditionPromotion,
  ) {}

  async act(data: { userId: number; price: number }) {
    const promocode = await this.promoCodeCreateToUserAfterFulfilledConditionPromotion.act(data);

    if (promocode) {
      await promocode.sendToUserViaEmail({
        subject: 'You earned a promocode!',
        body: (code) => `Congratulation, you fulfilled promotion! Here is your promocode: ${code}`,
      });
    }

    return promocode;
  }
}
