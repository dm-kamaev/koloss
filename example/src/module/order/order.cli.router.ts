import { AsyncOK } from '#/lib';
import { communicator } from '#/communicator';

export const orderJobs: Record<string, () => AsyncOK> = {
  orderSuccessArchive: async () => {
    const { orderSuccessArchiveCli } = await import('#/module/order/cli/order_success_archive.cli');
    const { OrderSuccessArchive } = await import('#/module/order/action/order_success_archive.action');
    return await orderSuccessArchiveCli({ OrderSuccessArchive, userCommunicator: communicator.user, args: process.argv });
  },
};
