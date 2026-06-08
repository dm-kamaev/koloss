import { IOrderCommunicator } from '@/communicator/order.communicator.type';
import { IUserCommunicator } from '@/communicator/user.communicator.type';
import { OrdersCountOfUser } from '@/module/order/action/orders_count_of_user.action';

export class OrderCommunicator implements IOrderCommunicator {
  constructor(
    // example circular dependency
    private readonly _userCommunicator: IUserCommunicator,
    private readonly GetCountUserOrdersClass = OrdersCountOfUser,
  ) {}

  async getCountUserOrders(userId: number) {
    return new this.GetCountUserOrdersClass().act({ userId });
  }
}
