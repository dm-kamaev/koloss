import { AsyncOK } from '#/lib';
import { IUserCommunicator } from '#/communicator/user.communicator.type';

export function orderJobs({ userCommunicator }: { userCommunicator: IUserCommunicator }): Record<string, () => AsyncOK> {
  return {
    orderSuccessArchive: async () => {
      const { orderSuccessArchiveCli } = await import('#/module/order/cli/order_success_archive.cli');
      const { OrderSuccessArchive } = await import('#/module/order/action/order_success_archive.action');
      return await orderSuccessArchiveCli({ OrderSuccessArchive, userCommunicator, args: process.argv });
    },
  };
}
