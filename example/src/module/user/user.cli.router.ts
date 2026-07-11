import { AsyncOK } from '#/lib';
import { communicator } from '#/communicator';
import { PromoCodeCreateToUsersDidntMakeOrderForTooLong } from '#user/action/promocode_create_to_users_didnt_make_order_for_too_long.action';

export const userJobs: Record<string, () => AsyncOK> = {
  promoCodeSendToUsersDidntMakeOrderForTooLong: async (): AsyncOK => {
    const { promoCodeCreateToUsersDidntMakeOrderForTooLongCli } = await import(
      '#/module/user/cli/promocode_send_to_users_didnt_make_order_for_too_long.cli'
    );
    return await promoCodeCreateToUsersDidntMakeOrderForTooLongCli({
      PromoCodeCreateToUsersDidntMakeOrderForTooLong,
      orderCommunicator: communicator.order,
      args: process.argv,
    });
  },
};
