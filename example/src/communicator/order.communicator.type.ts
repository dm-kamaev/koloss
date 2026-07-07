import { OrderRaw } from '../module/order/repository/order.db.js';

export interface IOrderCommunicator {
  getCountUserOrders(userId: number): Promise<number>;
  getCountUserOrdersWithPriceAbove(userId: number, minPrice: number): Promise<number>;
  findLastOrderByUserId(userId: number): Promise<OrderRaw | undefined>;
}
