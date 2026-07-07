import { OrderDb } from '../repository/order.db.js';

export class OrdersCountOfUser {
  constructor(private readonly orderDb = new OrderDb()) {}

  async act({ userId }: { userId: number }) {
    return this.orderDb.getCountByUserId(userId);
  }
}

export type OrdersCountOfUserCtor = typeof OrdersCountOfUser;
