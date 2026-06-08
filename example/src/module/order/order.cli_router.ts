import { communicator } from '@/communicator';

export const orderJobs: Record<string, () => Promise<{ ok: true }>> = {
  orderSuccessArchive: async () => {
    const { orderSuccessArchive } = await import('@order/cli/order_success_archive.cli');
    const { OrderSuccessArchive } = await import('@order/action/order_success_archive.action');
    return await orderSuccessArchive({ OrderSuccessArchive, userCommunicator: communicator.user, args: process.argv });
  },
};
