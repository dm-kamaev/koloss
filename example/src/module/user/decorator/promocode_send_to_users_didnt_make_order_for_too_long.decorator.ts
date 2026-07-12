import { PromoCodeCreateToUsersDidntMakeOrderForTooLong } from '#user/action/promocode_create_to_users_didnt_make_order_for_too_long.action';

export class PromoCodeSendToUsersDidntMakeOrderForTooLong {
  constructor(private readonly promoCodeCreateToUsersDidntMakeOrderForTooLong: PromoCodeCreateToUsersDidntMakeOrderForTooLong) {}

  async act(inactivityDays: number) {
    const userPromoCodes = await this.promoCodeCreateToUsersDidntMakeOrderForTooLong.act(inactivityDays);

    for (const promocode of userPromoCodes) {
      await promocode.sendToUserViaEmail({
        subject: 'We miss you!',
        body: (code) => `You haven't visited us for long time! Here is a promocode for you: ${code}`,
      });
    }

    return userPromoCodes;
  }
}
