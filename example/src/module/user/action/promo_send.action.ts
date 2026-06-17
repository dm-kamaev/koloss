import { UserDb } from '../repository/user.db';
import { IOrderCommunicator } from '@/communicator/order.communicator.type';
import { emailClientInstance } from '@/core/email/email_client.instance';
let i = 0;
export class PromoSend {
  constructor(
    private readonly orderCommunicator: IOrderCommunicator,
    private readonly userDb = new UserDb(),
  ) {}

  private generatePromocode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async act(inactivityDays: number): Promise<{ ok: true }> {
    const users = await this.userDb.getAll();
    const now = new Date();

    for (const user of users) {
      const lastOrder = await this.orderCommunicator.findLastOrderByUserId(user.id);

      if (!lastOrder) {
        // No orders ever, consider as inactive
        const promocode = this.generatePromocode();
        await emailClientInstance.dispatch(
          user.email,
          'We miss you!',
          `You haven't visited us for long time! Here is a promocode for you: ${promocode}`,
        );
        console.log(`Sent promo to user ${user.id} (no previous orders)`);
        continue;
      }

      const lastOrderDate = new Date(lastOrder.updatedAt);
      const diffTime = Math.abs(now.getTime() - lastOrderDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > inactivityDays) {
        const promocode = this.generatePromocode();
        console.log('emailClientInstance.dispatch', ++i);
        await emailClientInstance.dispatch(
          user.email,
          'We miss you!',
          `You haven't visited us for long time! Here is a promocode for you: ${promocode}`,
        );
        console.log(`Sent promo to user ${user.id} (last order ${diffDays} days ago)`);
      }
    }
    return { ok: true };
  }
}

export type PromoSendCtor = typeof PromoSend;
