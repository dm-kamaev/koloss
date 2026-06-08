import { IOrderCommunicator } from '../../communicator/order/order.type';
import type { UserRepository } from './db/user.repository';

export class UserGetByIdHandler {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly orderCommunicator: IOrderCommunicator,
  ) {}

  async exec(user_id: number) {
    const user = await this.userRepository.getById(user_id);

    if (!user) {
      throw new Error(`Not found user with id = ${user_id}`);
    }

    const orders = await this.orderCommunicator.getAllForUser(user.id);

    return {
      ...user,
      orders,
    };
  }
}
