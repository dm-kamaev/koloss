import { AsyncOK } from '#/lib';
import { IOrderCommunicator } from '#/communicator/order.communicator.type';
import { PromoCodeCreateToUsersDidntMakeOrderForTooLong } from '#user/action/promocode_create_to_users_didnt_make_order_for_too_long.action';

export function userJobs({ orderCommunicator }: { orderCommunicator: IOrderCommunicator }): Record<string, () => AsyncOK> {
  return {
    promoCodeSendToUsersDidntMakeOrderForTooLong: async (): AsyncOK => {
      const { promoCodeCreateToUsersDidntMakeOrderForTooLongCli } = await import(
        '#/module/user/cli/promocode_send_to_users_didnt_make_order_for_too_long.cli'
      );
      return await promoCodeCreateToUsersDidntMakeOrderForTooLongCli({
        PromoCodeCreateToUsersDidntMakeOrderForTooLong,
        orderCommunicator,
        args: process.argv,
      });
    },
  };
}
