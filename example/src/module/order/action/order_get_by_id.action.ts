import { IUserCommunicator } from '@/communicator/user.communicator.type';
import { OrderDb } from '../repository/order.db';

export class OrderGetById {
  constructor(
    private readonly userCommunicator: IUserCommunicator,
    private readonly orderDb = new OrderDb(),
  ) {}

  async act({ orderId }: { orderId: number }) {
    const order = await this.orderDb.getById(orderId);
    const user = await this.userCommunicator.getUserById(order.userId);
    return { id: order.id, user };
  }
}

export type OrderGetByIdCtor = typeof OrderGetById;
