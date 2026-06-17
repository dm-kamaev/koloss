import { parseArgs } from 'node:util';
import { z } from 'zod';
import { PromoSendCtor } from '../action/promo_send.action';
import { IOrderCommunicator } from '@/communicator/order.communicator.type';
import { UserDb } from '../repository/user.db';

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
    parse: () => {
      return schema.parse(values);
    },
  };
}

export async function promoSendCli({
  PromoSend,
  orderCommunicator,
  userDb,
  args = process.argv,
}: {
  PromoSend: PromoSendCtor;
  orderCommunicator: IOrderCommunicator;
  userDb?: UserDb;
  args: string[];
}): Promise<{ ok: true }> {
  const parsedArgs = PromoSendInputDto(args).parse();

  console.log(`JOB: promoSendCli - checking for users inactive for more than ${parsedArgs.inactivityDays} days`);
  const action = new PromoSend(orderCommunicator, userDb);
  return await action.act(parsedArgs.inactivityDays);
}
