import type { IOrderCommunicator } from '../../communicator/order/order.type';
import type { OrderGetAllForUserHandler } from './order_get_all_for_user.handler';

// export function createOrderCommunicator({
//   orderGetAllHandler,
//   orderCreateHandler,
// }: {
//   orderGetAllHandler: OrderGetAllHandler;
//   orderCreateHandler: OrderCreateHandler;
// }) {
//   return new OrderCommunicator({
//     orderGetAllHandler,
//     orderCreateHandler,
//   });
// }

export class OrderCommunicator implements IOrderCommunicator {
  constructor(
    private readonly handlers: {
      orderGetAllForUserHandler: OrderGetAllForUserHandler;
    },
  ) {}

  async getAllForUser(user_id: number) {
    return await this.handlers.orderGetAllForUserHandler.exec(user_id);
  }
}
