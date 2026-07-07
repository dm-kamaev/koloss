import { IOrderCommunicator } from '#/communicator/order.communicator.type';
import { IUserCommunicator } from '#/communicator/user.communicator.type';
import { OrdersCountOfUser } from '#/module/order/action/orders_count_of_user.action';
import { OrdersCountOfUserWithPriceAbove } from '#/module/order/action/orders_count_of_user_with_price_above.action';
import { OrderGetLastByUserId } from './action/order_get_last_by_user_id.action.js';
import { OrderRaw } from './repository/order.db.js';

export class OrderCommunicator implements IOrderCommunicator {
  constructor(
    // example circular dependency
    private readonly _userCommunicator: IUserCommunicator,
    private readonly GetCountUserOrdersClass = OrdersCountOfUser,
    private readonly GetCountUserOrdersWithPriceAboveAction = OrdersCountOfUserWithPriceAbove,
    private readonly GetLastByUserIdAction = OrderGetLastByUserId,
  ) {}

  async getCountUserOrders(userId: number) {
    return new this.GetCountUserOrdersClass().act({ userId });
  }

  async getCountUserOrdersWithPriceAbove(userId: number, minPrice: number) {
    return new this.GetCountUserOrdersWithPriceAboveAction().act({ userId, minPrice });
  }

  async findLastOrderByUserId(userId: number): Promise<OrderRaw | undefined> {
    return new this.GetLastByUserIdAction().act(userId);
  }
}
