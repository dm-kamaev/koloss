import { EmailSdk } from '@/core/email/email_sdk';
import { PromoCodeCreateToUsersDidntMakeOrderForTooLong } from '../action/promocode_create_to_users_didnt_make_order_for_too_long.action';

export class PromoCodeSend {
  constructor(
    private readonly promoCodeCreateToUsersDidntMakeOrderForTooLong: PromoCodeCreateToUsersDidntMakeOrderForTooLong,
    private readonly emailSdk = new EmailSdk(),
  ) {}

  async act(inactivityDays: number): Promise<{ ok: true }> {
    const userPromoCodes = await this.promoCodeCreateToUsersDidntMakeOrderForTooLong.act(inactivityDays);
    for (const promocode of userPromoCodes) {
      await promocode.sendToUserViaEmail(this.emailSdk, {
        subject: () => 'We miss you!',
        body: (code) => `You haven't visited us for long time! Here is a promocode for you: ${code}`,
      });
    }

    return { ok: true };
  }
}
