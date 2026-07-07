import { parseArgs } from 'node:util';
import { z } from 'zod';
import { PromoCodeCreateToUsersDidntMakeOrderForTooLongCtor } from '../action/promocode_create_to_users_didnt_make_order_for_too_long.action.js';
import { IOrderCommunicator } from '#/communicator/order.communicator.type';
import { PromoCodeSendToUsersDidntMakeOrderForTooLong } from '#user/decorator/promocode_send.decorator.js';
import { AsyncOK, OK } from '#/lib';

function PromoSendInputDto(args: string[]) {
  const { values } = parseArgs({
    args: args.slice(3),
    options: {
      inactivityDays: {
        type: 'string',
        short: 'd',
      },
    },
  });

  const schema = z.object({
    inactivityDays: z.coerce.number().int().positive({ message: 'Inactivity days must be a positive integer' }),
  });

  return {
    act: () => {
      return schema.parseAsync(values);
    },
  };
}

export async function promoCodeCreateToUsersDidntMakeOrderForTooLongCli({
  PromoCodeCreateToUsersDidntMakeOrderForTooLong,
  orderCommunicator,
  args = process.argv,
}: {
  PromoCodeCreateToUsersDidntMakeOrderForTooLong: PromoCodeCreateToUsersDidntMakeOrderForTooLongCtor;
  orderCommunicator: IOrderCommunicator;
  args: string[];
}): AsyncOK {
  const parsedArgs = await PromoSendInputDto(args).act();

  console.log(`JOB: promoSendCli - checking for users inactive for more than ${parsedArgs.inactivityDays} days`);

  await new PromoCodeSendToUsersDidntMakeOrderForTooLong(new PromoCodeCreateToUsersDidntMakeOrderForTooLong(orderCommunicator)).act(
    parsedArgs.inactivityDays,
  );

  return OK;
}
