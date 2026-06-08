import { GetLazy } from '../../../../src';
import { IUserCommunicator } from '../../communicator/user/user.type';
import type { OrderRepository } from './db/order.repository';

export class OrderGetAllHandler {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly userCommunicator: GetLazy<IUserCommunicator>,
  ) {}

  async exec() {
    const orders = await this.orderRepository.getAll();
    const userIds = orders.map((el) => el.user_id);
    const users = await this.userCommunicator().getUsersByIds(userIds);
    const hashUser = {};
    users.forEach((user) => (hashUser[user.id] = user));

    return orders.map((order) => {
      return {
        id: order.id,
        status: order.status,
        user: hashUser[order.user_id],
        products: order.products,
      };
    });
  }
}
