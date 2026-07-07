import { OrderDb } from '../repository/order.db.js';

export class OrdersCountOfUserWithPriceAbove {
  constructor(private readonly orderDb = new OrderDb()) {}

  async act({ userId, minPrice }: { userId: number; minPrice: number }) {
    return this.orderDb.getCountUserOrdersWithPriceAbove(userId, minPrice);
  }
}

export type OrdersCountOfUserWithPriceAboveCtor = typeof OrdersCountOfUserWithPriceAbove;
