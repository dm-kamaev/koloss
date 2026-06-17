import { UserDb } from '@/module/user/repository/user.db';
import { PromoSend } from '@/module/user/action/promo_send.action';
import { communicator } from '@/communicator';

export const userJobs: Record<string, () => Promise<{ ok: true }>> = {
  promoSend: async (): Promise<{ ok: true }> => {
    const { promoSendCli } = await import('@/module/user/cli/promo_send.cli');
    return await promoSendCli({
      PromoSend,
      orderCommunicator: communicator.order,
      userDb: new UserDb(),
      args: process.argv,
    });
  },
};
