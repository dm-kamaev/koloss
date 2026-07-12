import { parseArgs } from 'node:util';
import { PromoCodeCreateToUsersDidntMakeOrderForTooLongCtor } from '#user/action/promocode_create_to_users_didnt_make_order_for_too_long.action';
import { IOrderCommunicator } from '#/communicator/order.communicator.type';
import { PromoCodeSendToUsersDidntMakeOrderForTooLong } from '#user/decorator/promocode_send_to_users_didnt_make_order_for_too_long.decorator';
import { AsyncOK, OK } from '#/lib';
import { PromoSendInputDto } from '#user/dto/promocode_send_input.dto';

export async function promoCodeCreateToUsersDidntMakeOrderForTooLongCli({
  PromoCodeCreateToUsersDidntMakeOrderForTooLong,
  orderCommunicator,
  args = process.argv,
}: {
  PromoCodeCreateToUsersDidntMakeOrderForTooLong: PromoCodeCreateToUsersDidntMakeOrderForTooLongCtor;
  orderCommunicator: IOrderCommunicator;
  args: string[];
}): AsyncOK {
  const { values } = parseArgs({
    args: args.slice(3),
    options: {
      inactivityDays: {
        type: 'string',
        short: 'd',
      },
    },
  });
  const parsedArgs = await new PromoSendInputDto().act(values);

  console.log(`JOB: promoSendCli - checking for users inactive for more than ${parsedArgs.inactivityDays} days`);

  await new PromoCodeSendToUsersDidntMakeOrderForTooLong(new PromoCodeCreateToUsersDidntMakeOrderForTooLong(orderCommunicator)).act(
    parsedArgs.inactivityDays,
  );

  return OK;
}
