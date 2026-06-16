import { parseArgs } from 'node:util';
import { z } from 'zod';
import { IUserCommunicator } from '@/communicator/user.communicator.type';
import { OrderSuccessArchiveCtor } from '@/module/order/action/order_success_archive.action';

function OrderSuccessArchiveInputDto(args: string[]) {
  const { values } = parseArgs({
    args: args.slice(3),
    options: {
      date: {
        type: 'string',
      },
    },
  });

  const schema = z.object({
    date: z.iso.datetime({ message: 'Invalid date format' }),
  });

  return {
    parse: () => {
      return schema.parse(values);
    },
  };
}
export async function orderSuccessArchiveCli({
  userCommunicator,
  args = process.argv,
  OrderSuccessArchive,
}: {
  OrderSuccessArchive: OrderSuccessArchiveCtor;
  userCommunicator: IUserCommunicator;
  args: string[];
}) {
  const parsedArgs = OrderSuccessArchiveInputDto(args).parse();

  console.log('JOB: orderSuccessArchive');
  const action = new OrderSuccessArchive(userCommunicator);
  return await action.act(parsedArgs.date);
}
