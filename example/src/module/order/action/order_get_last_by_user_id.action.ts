import { OrderDb } from '../repository/order.db.js';
import { OrderRaw } from '../repository/order.db.js';

export class OrderGetLastByUserId {
  constructor(private readonly orderDb = new OrderDb()) {}

  async act(userId: number): Promise<OrderRaw | undefined> {
    return this.orderDb.getLastByUserId(userId);
  }
}
