import { IOrderCommunicator } from '@/communicator/order.communicator.type';
import { IUserCommunicator } from '@/communicator/user.communicator.type';
import { OrdersCountOfUser } from '@/module/order/action/orders_count_of_user.action';
import { OrderGetLastByUserId } from './action/order_get_last_by_user_id.action';
import { OrderRaw } from './repository/order.db';

export class OrderCommunicator implements IOrderCommunicator {
  constructor(
    // example circular dependency
    private readonly _userCommunicator: IUserCommunicator,
    private readonly GetCountUserOrdersClass = OrdersCountOfUser,
    private readonly getLastByUserIdAction = OrderGetLastByUserId,
  ) {}

  async getCountUserOrders(userId: number) {
    return new this.GetCountUserOrdersClass().act({ userId });
  }

  async findLastOrderByUserId(userId: number): Promise<OrderRaw | undefined> {
    return new this.getLastByUserIdAction().act(userId);
  }
}
