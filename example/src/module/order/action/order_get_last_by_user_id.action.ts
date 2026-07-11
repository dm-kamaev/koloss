import { OrderDb } from '../repository/order.db';
import { OrderRaw } from '../repository/order.db';

export class OrderGetLastByUserId {
  constructor(private readonly orderDb = new OrderDb()) {}

  async act(userId: number): Promise<OrderRaw | undefined> {
    return this.orderDb.getLastByUserId(userId);
  }
}
