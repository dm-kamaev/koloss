import { OrderRaw } from '../module/order/repository/order.db';

export interface IOrderCommunicator {
  getCountUserOrders(userId: number): Promise<number>;
  findLastOrderByUserId(userId: number): Promise<OrderRaw | undefined>;
}
