import { UserDb } from '#user/repository/user.db';
import { IOrderCommunicator } from '#/communicator/order.communicator.type';
import { UserPromoCode } from '#user/value_object/user_promocode.value_object';

export class PromoCodeCreateToUsersDidntMakeOrderForTooLong {
  constructor(
    private readonly orderCommunicator: IOrderCommunicator,
    private readonly userDb = new UserDb(),
  ) {}

  async act(inactivityDays: number): Promise<UserPromoCode[]> {
    const users = await this.userDb.getAll();
    const now = new Date();

    const promocodes: UserPromoCode[] = [];

    for (const user of users) {
      const lastOrder = await this.orderCommunicator.findLastOrderByUserId(user.id);

      if (!lastOrder) {
        // No orders ever, consider as inactive
        promocodes.push(new UserPromoCode(user));

        continue;
      }

      const lastOrderDate = new Date(lastOrder.updatedAt);
      const diffTime = Math.abs(now.getTime() - lastOrderDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > inactivityDays) {
        promocodes.push(new UserPromoCode(user));
        console.log(`Sent promo to user ${user.id} (last order ${diffDays} days ago)`);
      }
    }
    return promocodes;
  }
}

export type PromoCodeCreateToUsersDidntMakeOrderForTooLongCtor = typeof PromoCodeCreateToUsersDidntMakeOrderForTooLong;
