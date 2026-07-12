import { OrderDb } from '#order/repository/order.db';

export class OrdersCountOfUserWithPriceAbove {
  constructor(private readonly orderDb = new OrderDb()) {}

  async act({ userId, minPrice }: { userId: number; minPrice: number }) {
    return this.orderDb.getCountUserOrdersWithPriceAbove(userId, minPrice);
  }
}

export type OrdersCountOfUserWithPriceAboveCtor = typeof OrdersCountOfUserWithPriceAbove;
