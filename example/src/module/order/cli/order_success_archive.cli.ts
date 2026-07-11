import { parseArgs } from 'node:util';
import { IUserCommunicator } from '#/communicator/user.communicator.type';
import { OrderSuccessArchiveCtor } from '#/module/order/action/order_success_archive.action';
import { OrderSuccessArchiveInputDto } from '../dto/order_success_archive_input.dto';

export async function orderSuccessArchiveCli({
  userCommunicator,
  args = process.argv,
  OrderSuccessArchive,
}: {
  OrderSuccessArchive: OrderSuccessArchiveCtor;
  userCommunicator: IUserCommunicator;
  args: string[];
}) {
  const { values } = parseArgs({
    args: args.slice(3),
    options: {
      date: {
        type: 'string',
      },
    },
  });
  const parsedArgs = await new OrderSuccessArchiveInputDto().act(values);

  console.log('JOB: orderSuccessArchive');
  const action = new OrderSuccessArchive(userCommunicator);
  return await action.act(parsedArgs.date);
}
